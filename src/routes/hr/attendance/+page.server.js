import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';

export async function load({ url }) {
  const db   = getDb();
  const date = url.searchParams.get('date') ?? new Date().toISOString().split('T')[0];

  const records = await db`
    SELECT
      ar.id,
      ar.date,
      ar.am_in,
      ar.am_out,
      ar.pm_in,
      ar.pm_out,
      ar.status,
      ar.location,
      u.name          AS employee_name,
      u.employee_code,
      u.department,
      u.email
    FROM   attendance_records ar
    JOIN   users u ON u.id = ar.employee_id
    WHERE  ar.date = ${date}
    ORDER  BY u.name
  `;

  const present = records.filter(r => r.status === 'Present').length;
  const late    = records.filter(r => r.status === 'Late').length;
  const absentC = records.filter(r => r.status === 'Absent').length;

  return { records, date, stats: { present, late, absent: absentC, total: records.length } };
}

export const actions = {
  updateRecord: async ({ request }) => {
    const db   = getDb();
    const data = await request.formData();
    const id       = Number(data.get('record_id'));
    const amIn     = data.get('am_in')  || null;
    const amOut    = data.get('am_out') || null;
    const pmIn     = data.get('pm_in')  || null;
    const pmOut    = data.get('pm_out') || null;
    const status   = data.get('status')   ?? 'Present';
    const location = (data.get('location') ?? '').toString().trim();

    if (!id) return fail(400, { error: 'Invalid record.' });

    const VALID = ['Present', 'Late', 'Absent', 'Half Day'];
    if (!VALID.includes(status)) return fail(400, { error: 'Invalid status.' });

    await db`
      UPDATE attendance_records
      SET
        am_in          = ${amIn   ? new Date(amIn)   : null},
        am_out         = ${amOut  ? new Date(amOut)  : null},
        pm_in          = ${pmIn   ? new Date(pmIn)   : null},
        pm_out         = ${pmOut  ? new Date(pmOut)  : null},
        clock_in_time  = ${amIn   ? new Date(amIn)   : null},
        clock_out_time = ${pmOut  ? new Date(pmOut)  : null},
        status         = ${status},
        location       = ${location || null}
      WHERE id = ${id}
    `;

    return { success: true };
  },

  addRecord: async ({ request }) => {
    const db   = getDb();
    const data = await request.formData();
    const empId    = data.get('employee_id')?.toString();
    const date     = data.get('date')?.toString();
    const status   = (data.get('status') ?? 'Present').toString();
    const location = (data.get('location') ?? '').toString().trim();

    if (!empId || !date) return fail(400, { error: 'Employee and date are required.' });

    try {
      await db`
        INSERT INTO attendance_records (employee_id, date, status, location)
        VALUES (${empId}, ${date}, ${status}, ${location || null})
      `;
    } catch (err) {
      if (err.code === '23505') {
        return fail(409, { error: 'Record already exists for this employee on this date.' });
      }
      throw err;
    }

    return { success: true };
  }
};
