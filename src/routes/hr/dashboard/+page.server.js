import { getDb } from '$lib/server/db.js';

export async function load() {
  const db = getDb();

  const [empCount, pendingLeaves, todayAtt, leaveStats] = await Promise.all([
    db`SELECT COUNT(*) AS total FROM users WHERE role = 'employee' AND is_active = true`,
    db`SELECT COUNT(*) AS total FROM leave_requests WHERE status = 'Pending'`,
    db`
      SELECT COUNT(*) AS total FROM attendance_records
      WHERE date = CURRENT_DATE AND clock_in_time IS NOT NULL
    `,
    db`
      SELECT status, COUNT(*) AS count
      FROM   leave_requests
      GROUP  BY status
    `
  ]);

  const leaveByStatus = {};
  for (const row of leaveStats) leaveByStatus[row.status] = Number(row.count);

  // Recent activity feed
  const recentActivity = await db`
    SELECT
      'leave'          AS type,
      lr.created_at    AS ts,
      u.name           AS actor,
      lr.status,
      lt.name          AS detail
    FROM   leave_requests lr
    JOIN   users      u  ON u.id  = lr.employee_id
    JOIN   leave_types lt ON lt.id = lr.leave_type_id
    ORDER  BY lr.created_at DESC
    LIMIT  8
  `;

  // Dept breakdown
  const deptStats = await db`
    SELECT department, COUNT(*) AS count
    FROM   users
    WHERE  role = 'employee' AND is_active = true
    GROUP  BY department
    ORDER  BY count DESC
  `;

  return {
    metrics: {
      totalEmployees: Number(empCount[0].total),
      pendingLeaves:  Number(pendingLeaves[0].total),
      todayPresent:   Number(todayAtt[0].total),
      approvedLeaves: leaveByStatus['Approved'] ?? 0
    },
    recentActivity,
    deptStats
  };
}
