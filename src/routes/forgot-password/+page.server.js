import { fail } from '@sveltejs/kit';
import crypto from 'crypto';
import { getDb } from '$lib/server/db.js';
import { sendPasswordResetEmail } from '$lib/server/email.js';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = (data.get('email') ?? '').toString().trim().toLowerCase();

    if (!email) {
      return fail(400, { error: 'Email is required.' });
    }

    const db = getDb();

    // Look up the user — always return success to avoid email enumeration
    const rows = await db`
      SELECT id, name, email FROM users
      WHERE LOWER(email) = ${email} AND is_active = true
    `;

    if (rows.length > 0) {
      const user = rows[0];

      // Delete any existing token for this user
      await db`DELETE FROM password_reset_tokens WHERE user_id = ${user.id}`;

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

      await db`
        INSERT INTO password_reset_tokens (token, user_id, expires_at)
        VALUES (${token}, ${user.id}, ${expiresAt})
      `;

      await sendPasswordResetEmail(user.email, user.name, token);
    }

    // Always return success (prevents email enumeration)
    return { success: true };
  }
};
