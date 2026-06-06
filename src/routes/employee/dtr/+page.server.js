import { getDb } from '$lib/server/db.js';

export async function load({ locals, url }) {
  const db  = getDb();
  const uid = locals.user.id;

  const now   = new Date();
  const year  = Math.min(Math.max(Number(url.searchParams.get('year')  ?? now.getFullYear()), 2020), 2099);
  const month = Math.min(Math.max(Number(url.searchParams.get('month') ?? now.getMonth() + 1), 1), 12);

  const pad       = n => String(n).padStart(2, '0');
  const startDate = `${year}-${pad(month)}-01`;
  const daysCount = new Date(year, month, 0).getDate();
  const endDate   = `${year}-${pad(month)}-${daysCount}`;

  const records = await db`
    SELECT date, am_in, am_out, pm_in, pm_out, status, location
    FROM   attendance_records
    WHERE  employee_id = ${uid}
      AND  date >= ${startDate}::date
      AND  date <= ${endDate}::date
    ORDER  BY date
  `;

  // Map ISO date string → record
  const recordMap = {};
  for (const r of records) {
    const key = new Date(r.date).toISOString().split('T')[0];
    recordMap[key] = r;
  }

  // Build full calendar (every day of the month)
  const days = [];
  for (let d = 1; d <= daysCount; d++) {
    const dateStr  = `${year}-${pad(month)}-${pad(d)}`;
    const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay(); // 0=Sun
    days.push({
      day: d,
      dateStr,
      dayOfWeek,
      isSunday:   dayOfWeek === 0,
      isSaturday: dayOfWeek === 6,
      record: recordMap[dateStr] ?? null
    });
  }

  // Totals
  let totalMins = 0;
  let present = 0, late = 0, absent = 0;
  for (const r of records) {
    if (r.status === 'Present') present++;
    else if (r.status === 'Late') late++;
    else if (r.status === 'Absent') absent++;
    if (r.am_in && r.am_out) totalMins += (new Date(r.am_out) - new Date(r.am_in)) / 60_000;
    if (r.pm_in && r.pm_out) totalMins += (new Date(r.pm_out) - new Date(r.pm_in)) / 60_000;
  }

  return {
    year, month, days,
    summary: {
      present, late, absent,
      totalHours: (totalMins / 60).toFixed(2)
    }
  };
}
