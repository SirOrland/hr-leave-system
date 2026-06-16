import { getDb } from '$lib/server/db.js';

function csv(rows) {
  return rows.map(r =>
    r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\r\n');
}

export async function GET({ url }) {
  const db         = getDb();
  const department = url.searchParams.get('department') || null;
  const status     = url.searchParams.get('status') || null;  // 'active' | 'inactive' | null

  let records = await db`
    SELECT
      employee_code, name, email, role, department,
      CASE WHEN is_active THEN 'Active' ELSE 'Inactive' END AS status,
      TO_CHAR(created_at AT TIME ZONE 'Asia/Manila', 'YYYY-MM-DD') AS date_joined
    FROM users
    WHERE TRUE
      ${department ? db`AND department = ${department}` : db``}
      ${status === 'active'   ? db`AND is_active = true`  : db``}
      ${status === 'inactive' ? db`AND is_active = false` : db``}
    ORDER BY employee_code
  `;

  const header = ['Employee Code','Name','Email','Role','Department','Status','Date Joined'];
  const body   = records.map(r => [
    r.employee_code, r.name, r.email, r.role,
    r.department ?? '', r.status, r.date_joined
  ]);

  const content = csv([header, ...body]);

  return new Response('﻿' + content, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="employees.csv"'
    }
  });
}
