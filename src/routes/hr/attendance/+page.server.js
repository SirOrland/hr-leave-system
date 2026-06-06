import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';

export async function load({ url }) {
  const db   = getDb();
  const date = url.searchParams.get('date') ?? new Date().toISOString().split('T')[0];

  const records = await db`
    SELECT
      ar.id,
      ar.date,
      ar.clock_in_time,
      ar.clock_out_time,
      ar.status,
      ar.location,
      u.name            AS employee_name,
      u.employee_code,
      u.department,
      u.email
    FROM   attendance_records ar
    JOIN   users u ON u.id = ar.employee_id
    WHERE  ar.date = ${date}
    ORDER  BY u.name
  `;

  // Summary stats for selected date
  const present  = records.filter(r => r.status === 'Present').length;
  const late     = records.filter(r => r.status === 'Late').length;
  const absentC  = records.filter(r => r.status === 'Absent').length;

  return { records, date, stats: { present, late, absent: absentC, total: records.length } };
}

export const actions = {
  updateRecord: async ({ request }) => {
    const db   = getDb();
    const data = await request.formData();
    const id          = Number(data.get('record_id'));
    const clockIn     = data.get('clock_in')  ?? null;
    const clockOut    = data.get('clock_out') ?? null;
    const status      = data.get('status')    ?? 'Present';
    const location    = (data.get('location') ?? '').toString().trim();

    if (!id) return fail(400, { error: 'Invalid record.' });

    const VALID = ['Present', 'Late', 'Absent', 'Half Day'];
    if (!VALID.includes(status)) return fail(400, { error: 'Invalid status.' });

    await db`
      UPDATE attendance_records
      SET
        clock_in_time  = ${clockIn  ? new Date(clockIn)  : null},
        clock_out_time = ${clockOut ? new Date(clockOut) : null},
        status         = ${status},
        location       = ${location || null}
      WHERE id = ${id}
    `;

    return { success: true };
  },

  addRecord: async ({ request }) => {
    const db   = getDb();
    const data = await request.formData();
    const empId   = data.get('employee_id')?.toString();
    const date    = data.get('date')?.toString();
    const status  = (data.get('status') ?? 'Present').toString();
    const location = (data.get('location') ?? '').toString().trim();

    if (!empId || !date) return fail(400, { error: 'Employee and date are required.' });

    try {
      await db`
        INSERT INTO attendance_records (employee_id, date, status, location, clock_in_time)
        VALUES (${empId}, ${date}, ${status}, ${location || null}, NOW())
      `;
    } catch (err) {
      if (err.code === '23505') {
        return fail(409, { error: 'Attendance record already exists for this employee on this date.' });
      }
      throw err;
    }

    return { success: true };
  }
};
