import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db.js';

const SESSION_DURATION_DAYS = 7;

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export async function createSession(userId) {
  const db = getDb();
  const id = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 86_400_000);

  await db`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${id}, ${userId}, ${expiresAt})
  `;

  return { id, expiresAt };
}

export async function getSession(sessionId) {
  const db = getDb();
  const rows = await db`
    SELECT
      s.id AS session_id,
      s.expires_at,
      u.id, u.name, u.email, u.role,
      u.department, u.employee_code, u.is_active
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId}
      AND s.expires_at > NOW()
      AND u.is_active = true
  `;
  return rows[0] ?? null;
}

export async function deleteSession(sessionId) {
  const db = getDb();
  await db`DELETE FROM sessions WHERE id = ${sessionId}`;
}

export function setSessionCookie(cookies, sessionId, expiresAt) {
  cookies.set('session_id', sessionId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt
  });
}

export function clearSessionCookie(cookies) {
  cookies.delete('session_id', { path: '/' });
}

export const ROLE_HOME = {
  employee: '/employee/dashboard',
  manager: '/manager/dashboard',
  hr_admin: '/hr/dashboard'
};
