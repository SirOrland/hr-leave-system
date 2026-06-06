import { redirect } from '@sveltejs/kit';
import { deleteSession, clearSessionCookie } from '$lib/server/auth.js';

export async function POST({ cookies }) {
  const sessionId = cookies.get('session_id');
  if (sessionId) {
    await deleteSession(sessionId).catch(() => {});
    clearSessionCookie(cookies);
  }
  throw redirect(302, '/login');
}
