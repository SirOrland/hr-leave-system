import { getDb } from '$lib/server/db.js';

function toCSV(rows) {
  return rows.map(r =>
    r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\r\n');
}

function fmtTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Manila'
  });
}

function calcHours(am_in, am_out, pm_in, pm_out) {
  let mins = 0;
  if (am_in && am_out) mins += (new Date(am_out) - new Date(am_in)) / 60_000;
  if (pm_in && pm_out) mins += (new Date(pm_out) - new Date(pm_in)) / 60_000;
  if (!mins) return '';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

export async function GET({ url }) {
  const db         = getDb();
  const today      = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const dateFrom   = url.searchParams.get('from') || monthStart;
  const dateTo     = url.searchParams.get('to')   || today;
  const department = url.searchParams.get('department') || '';

  let records = await db`
    SELECT
      TO_CHAR(ar.date, 'YYYY-MM-DD') AS date,
      u.employee_code,
      u.name,
      u.department,
      ar.am_in,
      ar.am_out,
      ar.pm_in,
      ar.pm_out,
      ar.status,
      ar.location
    FROM attendance_records ar
    JOIN users u ON u.id = ar.employee_id
    WHERE ar.date BETWEEN ${dateFrom}::date AND ${dateTo}::date
    ORDER BY ar.date, u.name
  `;

  if (department) records = records.filter(r => r.department === department);

  const header = [
    'Date','Employee Code','Employee Name','Department',
    'AM Time In','AM Time Out','PM Time In','PM Time Out',
    'Total Hours','Status','Location'
  ];

  const body = records.map(r => [
    r.date,
    r.employee_code,
    r.name,
    r.department ?? '',
    fmtTime(r.am_in),
    fmtTime(r.am_out),
    fmtTime(r.pm_in),
    fmtTime(r.pm_out),
    calcHours(r.am_in, r.am_out, r.pm_in, r.pm_out),
    r.status,
    r.location ?? ''
  ]);

  const filename = `attendance_${dateFrom}_to_${dateTo}.csv`;

  return new Response('﻿' + toCSV([header, ...body]), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
