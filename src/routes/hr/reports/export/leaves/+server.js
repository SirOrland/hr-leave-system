import { getDb } from '$lib/server/db.js';

function csv(rows) {
  return rows.map(r =>
    r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\r\n');
}

export async function GET({ url }) {
  const db         = getDb();
  const dateFrom   = url.searchParams.get('from') || new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10);
  const dateTo     = url.searchParams.get('to')   || new Date().toISOString().slice(0,10);
  const status     = url.searchParams.get('status') || null;
  const department = url.searchParams.get('department') || null;

  const records = await db`
    SELECT
      lr.id,
      u.employee_code,
      u.name,
      u.department,
      lt.name                                                            AS leave_type,
      TO_CHAR(lr.start_date, 'YYYY-MM-DD')                             AS start_date,
      TO_CHAR(lr.end_date,   'YYYY-MM-DD')                             AS end_date,
      lr.duration_days,
      lr.reason,
      lr.status,
      TO_CHAR(lr.created_at AT TIME ZONE 'Asia/Manila', 'YYYY-MM-DD') AS date_filed
    FROM leave_requests lr
    JOIN users     u  ON u.id  = lr.employee_id
    JOIN leave_types lt ON lt.id = lr.leave_type_id
    WHERE lr.created_at::date BETWEEN ${dateFrom}::date AND ${dateTo}::date
      ${status     ? db`AND lr.status      = ${status}`     : db``}
      ${department ? db`AND u.department   = ${department}` : db``}
    ORDER BY lr.created_at DESC
  `;

  const header = [
    'Request ID','Employee Code','Employee Name','Department',
    'Leave Type','Start Date','End Date','Duration (Days)',
    'Reason','Status','Date Filed'
  ];

  const body = records.map(r => [
    r.id, r.employee_code, r.name, r.department ?? '',
    r.leave_type, r.start_date, r.end_date, r.duration_days,
    r.reason, r.status, r.date_filed
  ]);

  const filename = `leave_requests_${dateFrom}_to_${dateTo}.csv`;

  return new Response('﻿' + csv([header, ...body]), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
