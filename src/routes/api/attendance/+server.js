import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';

/** GET /api/attendance — returns today's record for the current user */
export async function GET({ locals }) {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const db   = getDb();
  const rows = await db`
    SELECT date, clock_in_time, clock_out_time, status, location
    FROM   attendance_records
    WHERE  employee_id = ${locals.user.id} AND date = CURRENT_DATE
    LIMIT  1
  `;

  return json(rows[0] ?? null);
}
