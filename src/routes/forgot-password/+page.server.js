import { fail } from '@sveltejs/kit';
import crypto from 'crypto';
import { getDb } from '$lib/server/db.js';
import { sendPasswordResetEmail } from '$lib/server/email.js';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

async function ensureTable(db) {
  await db`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token       TEXT        PRIMARY KEY,
      user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at  TIMESTAMPTZ NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = (data.get('email') ?? '').toString().trim().toLowerCase();

    if (!email) {
      return fail(400, { error: 'Email is required.' });
    }

    const db = getDb();

    try {
      await ensureTable(db);
    } catch (err) {
      console.error('[forgot-password] DB setup error:', err);
      return fail(500, { error: 'A database error occurred. Please try again later.' });
    }

    // Look up the user — always return the same response to avoid email enumeration
    let rows;
    try {
      rows = await db`
        SELECT id, name, email FROM users
        WHERE LOWER(email) = ${email} AND is_active = true
      `;
    } catch (err) {
      console.error('[forgot-password] DB query error:', err);
      return fail(500, { error: 'A database error occurred. Please try again later.' });
    }

    if (rows.length > 0) {
      const user = rows[0];

      try {
        await db`DELETE FROM password_reset_tokens WHERE user_id = ${user.id}`;

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

        await db`
          INSERT INTO password_reset_tokens (token, user_id, expires_at)
          VALUES (${token}, ${user.id}, ${expiresAt})
        `;

        await sendPasswordResetEmail(user.email, user.name, token);
      } catch (err) {
        console.error('[forgot-password] Error sending reset email:', err);

        // Check if it's a missing SMTP config error
        if (err.message?.includes('SMTP_HOST') || err.message?.includes('not configured')) {
          return fail(500, {
            error: 'Email sending is not configured on this server. Please contact your administrator.'
          });
        }

        return fail(500, {
          error: 'Failed to send the reset email. Please try again later.'
        });
      }
    }

    // Always return success to avoid revealing which emails are registered
    return { success: true };
  }
};
