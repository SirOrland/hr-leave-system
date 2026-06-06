import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';

/** GET /api/leave — list leave requests for the current user */
export async function GET({ locals, url }) {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const db     = getDb();
  const status = url.searchParams.get('status');

  const rows = await db`
    SELECT
      lr.id, lr.status, lr.start_date, lr.end_date, lr.duration_days,
      lr.reason, lr.created_at,
      lt.name AS leave_type
    FROM   leave_requests lr
    JOIN   leave_types lt ON lt.id = lr.leave_type_id
    WHERE  lr.employee_id = ${locals.user.id}
    ${status ? db`AND lr.status = ${status}` : db``}
    ORDER  BY lr.created_at DESC
    LIMIT  50
  `;

  return json(rows);
}
