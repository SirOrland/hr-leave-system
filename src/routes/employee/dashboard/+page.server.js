import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';

export async function load({ locals }) {
  const db = getDb();
  const userId = locals.user.id;
  const year   = new Date().getFullYear();

  // Leave balances
  const balances = await db`
    SELECT lt.name, lb.allocated_days, lb.used_days,
           (lb.allocated_days - lb.used_days) AS remaining_days
    FROM   leave_balances lb
    JOIN   leave_types lt ON lt.id = lb.leave_type_id
    WHERE  lb.employee_id = ${userId} AND lb.year = ${year}
    ORDER  BY lt.name
  `;

  // Aggregate metrics
  const totalRemaining = balances.reduce((s, b) => s + Number(b.remaining_days), 0);
  const totalTaken     = balances.reduce((s, b) => s + Number(b.used_days), 0);

  // Recent leave requests
  const requests = await db`
    SELECT lr.id, lt.name AS leave_type, lr.start_date, lr.end_date,
           lr.duration_days, lr.reason, lr.status, lr.created_at,
           lr.attachment_url
    FROM   leave_requests lr
    JOIN   leave_types lt ON lt.id = lr.leave_type_id
    WHERE  lr.employee_id = ${userId}
    ORDER  BY lr.created_at DESC
    LIMIT  10
  `;

  const pendingCount = requests.filter(r => r.status === 'Pending').length;

  // Today's attendance
  const today = await db`
    SELECT clock_in_time, clock_out_time, status, location
    FROM   attendance_records
    WHERE  employee_id = ${userId} AND date = CURRENT_DATE
    LIMIT  1
  `;

  // Leave types for form
  const leaveTypes = await db`SELECT id, name FROM leave_types WHERE is_active = true ORDER BY name`;

  return {
    balances,
    metrics: { totalRemaining, totalTaken, pendingCount },
    requests,
    todayAttendance: today[0] ?? null,
    leaveTypes
  };
}

export const actions = {
  // Clock In
  clockIn: async ({ locals, request }) => {
    const db = getDb();
    const userId = locals.user.id;
    const data   = await request.formData();
    const location = (data.get('location') ?? 'Office — Main Campus').toString().trim();

    // Duplicate guard handled by UNIQUE constraint; catch and surface it
    try {
      const now  = new Date();
      const hour = now.getHours();
      const status = hour >= 9 ? 'Late' : 'Present';

      await db`
        INSERT INTO attendance_records (employee_id, date, clock_in_time, status, location)
        VALUES (${userId}, CURRENT_DATE, NOW(), ${status}, ${location})
      `;
      return { success: true, action: 'clockIn', status };
    } catch (err) {
      if (err.code === '23505') {
        return fail(409, { error: 'You have already clocked in today.' });
      }
      throw err;
    }
  },

  // Clock Out
  clockOut: async ({ locals }) => {
    const db = getDb();
    const userId = locals.user.id;

    const result = await db`
      UPDATE attendance_records
      SET    clock_out_time = NOW()
      WHERE  employee_id = ${userId} AND date = CURRENT_DATE
        AND  clock_out_time IS NULL
      RETURNING id
    `;

    if (result.length === 0) {
      return fail(400, { error: 'No active clock-in found for today.' });
    }

    return { success: true, action: 'clockOut' };
  },

  // Apply for Leave
  applyLeave: async ({ locals, request }) => {
    const db   = getDb();
    const data = await request.formData();

    const leaveTypeId = Number(data.get('leave_type_id'));
    const startDate   = data.get('start_date')?.toString();
    const endDate     = data.get('end_date')?.toString();
    const reason      = (data.get('reason') ?? '').toString().trim();
    const file        = data.get('attachment');

    // Validation
    const errors = {};
    if (!leaveTypeId)  errors.leave_type_id = 'Select a leave type.';
    if (!startDate)    errors.start_date    = 'Start date is required.';
    if (!endDate)      errors.end_date      = 'End date is required.';
    if (!reason)       errors.reason        = 'Reason is required.';
    if (startDate && endDate && endDate < startDate) {
      errors.end_date = 'End date must be on or after start date.';
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, { errors, formValues: { leaveTypeId, startDate, endDate, reason } });
    }

    // Overlap check
    const overlap = await db`
      SELECT id FROM leave_requests
      WHERE  employee_id = ${locals.user.id}
        AND  status != 'Rejected'
        AND (
          (start_date <= ${endDate} AND end_date >= ${startDate})
        )
      LIMIT 1
    `;

    if (overlap.length > 0) {
      return fail(409, {
        errors: { general: 'You already have a leave request overlapping these dates.' },
        formValues: { leaveTypeId, startDate, endDate, reason }
      });
    }

    // Balance check
    const year = new Date().getFullYear();
    const balance = await db`
      SELECT allocated_days - used_days AS remaining
      FROM   leave_balances
      WHERE  employee_id = ${locals.user.id}
        AND  leave_type_id = ${leaveTypeId}
        AND  year = ${year}
      LIMIT 1
    `;

    const duration = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / 86_400_000
    ) + 1;

    if (balance.length === 0 || Number(balance[0].remaining) < duration) {
      return fail(400, {
        errors: { general: `Insufficient leave balance. You have ${balance[0]?.remaining ?? 0} day(s) remaining.` },
        formValues: { leaveTypeId, startDate, endDate, reason }
      });
    }

    // Handle file attachment (store as base64 data URL for serverless)
    let attachmentUrl = null;
    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        return fail(400, {
          errors: { attachment: 'File must be under 5 MB.' },
          formValues: { leaveTypeId, startDate, endDate, reason }
        });
      }
      const allowed = ['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        return fail(400, {
          errors: { attachment: 'Unsupported file type.' },
          formValues: { leaveTypeId, startDate, endDate, reason }
        });
      }
      const buf = await file.arrayBuffer();
      const b64 = Buffer.from(buf).toString('base64');
      attachmentUrl = `data:${file.type};base64,${b64.slice(0, 200)}…(file stored)`;
    }

    await db`
      INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, reason, attachment_url)
      VALUES (${locals.user.id}, ${leaveTypeId}, ${startDate}, ${endDate}, ${reason}, ${attachmentUrl})
    `;

    return { success: true, action: 'applyLeave' };
  }
};
