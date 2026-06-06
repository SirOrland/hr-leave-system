import { redirect } from '@sveltejs/kit';
import { getSession, clearSessionCookie, ROLE_HOME } from '$lib/server/auth.js';

// Routes that are accessible to every role
const PUBLIC_PATHS = ['/login'];

// Map route prefix → allowed roles
const ROLE_GUARDS = [
  { prefix: '/hr',       roles: ['hr_admin'] },
  { prefix: '/manager',  roles: ['manager', 'hr_admin'] },
  { prefix: '/employee', roles: ['employee', 'manager', 'hr_admin'] }
];

export async function handle({ event, resolve }) {
  const { cookies, url } = event;
  const path = url.pathname;

  // --- Resolve session ---
  const sessionId = cookies.get('session_id');
  if (sessionId) {
    const user = await getSession(sessionId).catch(() => null);
    if (user) {
      event.locals.user = user;
    } else {
      clearSessionCookie(cookies);
    }
  }

  const authed = !!event.locals.user;

  // Redirect authenticated users away from login/root
  if (authed && (path === '/' || path === '/login')) {
    throw redirect(302, ROLE_HOME[event.locals.user.role] ?? '/login');
  }

  // Allow public paths without auth
  if (PUBLIC_PATHS.some(p => path.startsWith(p))) {
    return resolve(event);
  }

  // Allow API routes (they do their own auth checks)
  if (path.startsWith('/api/')) {
    return resolve(event);
  }

  // Root → redirect to login
  if (path === '/') {
    throw redirect(302, '/login');
  }

  // RBAC guard for protected route prefixes
  for (const guard of ROLE_GUARDS) {
    if (path.startsWith(guard.prefix)) {
      if (!authed) throw redirect(302, '/login');
      if (!guard.roles.includes(event.locals.user.role)) {
        throw redirect(302, ROLE_HOME[event.locals.user.role] ?? '/login');
      }
      break;
    }
  }

  // Any other authenticated route — require login
  if (!authed) throw redirect(302, '/login');

  return resolve(event);
}
