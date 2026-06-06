import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';

/**
 * Polling endpoint — returns { changed: true } when any of the current user's
 * leave requests changed status in the last 20 seconds.
 * Called every 15 s from the employee dashboard.
 */
export async function GET({ locals, url }) {
  if (!locals.user) return json({ changed: false }, { status: 401 });

  const db = getDb();
  const since = url.searchParams.get('since');
  const since_ts = since ? new Date(Number(since)) : new Date(Date.now() - 20_000);

  const rows = await db`
    SELECT id FROM leave_requests
    WHERE  employee_id = ${locals.user.id}
      AND  updated_at  > ${since_ts}
      AND  status != 'Pending'
    LIMIT 1
  `;

  return json({ changed: rows.length > 0, ts: Date.now() });
}
