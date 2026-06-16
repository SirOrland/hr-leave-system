import { getDb } from '$lib/server/db.js';

export async function load() {
  const db = getDb();

  const [depts, counts] = await Promise.all([
    db`SELECT name FROM departments WHERE is_active = true ORDER BY name`,
    db`
      SELECT
        (SELECT COUNT(*) FROM users WHERE is_active = true)         AS employees,
        (SELECT COUNT(*) FROM attendance_records
          WHERE date = CURRENT_DATE)                                AS attendance_today,
        (SELECT COUNT(*) FROM leave_requests)                       AS total_leaves,
        (SELECT COUNT(*) FROM leave_requests WHERE status='Pending') AS pending_leaves
    `
  ]);

  return {
    departments: depts.map(d => d.name),
    counts: counts[0]
  };
}
