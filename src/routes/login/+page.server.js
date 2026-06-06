import { fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';
import { verifyPassword, createSession, setSessionCookie, ROLE_HOME } from '$lib/server/auth.js';

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email    = (data.get('email')    ?? '').toString().trim().toLowerCase();
    const password = (data.get('password') ?? '').toString();

    // Basic validation
    if (!email || !password) {
      return fail(400, { error: 'Email and password are required.', email });
    }

    if (!email.includes('@')) {
      return fail(400, { error: 'Enter a valid email address.', email });
    }

    const db = getDb();

    // Fetch user
    const rows = await db`
      SELECT id, name, email, password_hash, role, is_active
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    const user = rows[0];

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return fail(401, { error: 'Invalid email or password.', email });
    }

    if (!user.is_active) {
      return fail(403, { error: 'Your account is deactivated. Contact HR.', email });
    }

    // Create session
    const session = await createSession(user.id);
    setSessionCookie(cookies, session.id, session.expiresAt);

    throw redirect(302, ROLE_HOME[user.role] ?? '/login');
  }
};
