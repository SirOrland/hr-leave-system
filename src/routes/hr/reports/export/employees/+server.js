import { getDb } from '$lib/server/db.js';

function toCSV(rows) {
  return rows.map(r =>
    r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\r\n');
}

export async function GET({ url }) {
  const db         = getDb();
  const department = url.searchParams.get('department') || '';
  const status     = url.searchParams.get('status') || '';

  let records = await db`
    SELECT
      employee_code,
      name,
      email,
      role,
      department,
      is_active,
      TO_CHAR(created_at AT TIME ZONE 'Asia/Manila', 'YYYY-MM-DD') AS date_joined
    FROM users
    ORDER BY employee_code
  `;

  if (department) records = records.filter(r => r.department === department);
  if (status === 'active')   records = records.filter(r => r.is_active);
  if (status === 'inactive') records = records.filter(r => !r.is_active);

  const header = ['Employee Code','Name','Email','Role','Department','Status','Date Joined'];
  const body   = records.map(r => [
    r.employee_code,
    r.name,
    r.email,
    r.role,
    r.department ?? '',
    r.is_active ? 'Active' : 'Inactive',
    r.date_joined
  ]);

  return new Response('﻿' + toCSV([header, ...body]), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="employees.csv"'
    }
  });
}
