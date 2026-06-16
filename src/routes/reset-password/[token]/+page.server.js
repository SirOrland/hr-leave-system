import { fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';
import { hashPassword } from '$lib/server/auth.js';

export async function load({ params }) {
  const db = getDb();
  try {
    const rows = await db`
      SELECT t.token, t.expires_at, u.name
      FROM password_reset_tokens t
      JOIN users u ON t.user_id = u.id
      WHERE t.token = ${params.token}
        AND t.expires_at > NOW()
    `;
    if (rows.length === 0) return { invalid: true };
    return { name: rows[0].name };
  } catch {
    return { invalid: true };
  }
}

export const actions = {
  default: async ({ request, params }) => {
    const data = await request.formData();
    const password = data.get('password')?.toString() ?? '';
    const confirm  = data.get('confirm')?.toString() ?? '';

    if (password.length < 8) {
      return fail(400, { error: 'Password must be at least 8 characters.' });
    }
    if (password !== confirm) {
      return fail(400, { error: 'Passwords do not match.' });
    }

    const db = getDb();

    let rows;
    try {
      rows = await db`
        SELECT user_id FROM password_reset_tokens
        WHERE token = ${params.token}
          AND expires_at > NOW()
      `;
    } catch (err) {
      console.error('[reset-password] DB error:', err);
      return fail(500, { error: 'A database error occurred. Please try again.' });
    }

    if (rows.length === 0) {
      return fail(400, { error: 'This reset link is invalid or has expired.' });
    }

    const { user_id } = rows[0];
    const passwordHash = await hashPassword(password);

    await db`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${user_id}`;
    await db`DELETE FROM password_reset_tokens WHERE token = ${params.token}`;
    await db`DELETE FROM sessions WHERE user_id = ${user_id}`;

    throw redirect(303, '/login?reset=1');
  }
};
