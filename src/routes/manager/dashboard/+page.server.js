import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';

export async function load({ locals }) {
  const db = getDb();

  // All leave requests visible to manager (their department + all for hr_admin)
  const requests = await db`
    SELECT
      lr.id, lr.status, lr.start_date, lr.end_date,
      lr.duration_days, lr.reason, lr.created_at,
      (lr.attachment_url IS NOT NULL AND lr.attachment_url != '') AS has_attachment,
      lt.name AS leave_type,
      u.name  AS employee_name,
      u.employee_code,
      u.department,
      u.email AS employee_email
    FROM   leave_requests lr
    JOIN   leave_types lt ON lt.id = lr.leave_type_id
    JOIN   users u        ON u.id  = lr.employee_id
    WHERE  u.role = 'employee'
    ORDER  BY
      CASE lr.status WHEN 'Pending' THEN 0 WHEN 'Approved' THEN 1 ELSE 2 END,
      lr.created_at DESC
    LIMIT 100
  `;

  const pending  = requests.filter(r => r.status === 'Pending').length;
  const approved = requests.filter(r => r.status === 'Approved').length;
  const rejected = requests.filter(r => r.status === 'Rejected').length;

  return { requests, metrics: { pending, approved, rejected } };
}

export const actions = {
  approve: async ({ locals, request }) => {
    const db   = getDb();
    const data = await request.formData();
    const id   = Number(data.get('request_id'));
    const remarks = (data.get('remarks') ?? '').toString().trim();

    if (!id) return fail(400, { error: 'Invalid request.' });

    // Fetch request to compute balance deduction
    const rows = await db`
      SELECT lr.*, u.id AS uid
      FROM   leave_requests lr
      JOIN   users u ON u.id = lr.employee_id
      WHERE  lr.id = ${id} AND lr.status = 'Pending'
      LIMIT 1
    `;

    if (rows.length === 0) return fail(404, { error: 'Request not found or already processed.' });
    const req = rows[0];

    // Atomic transaction: update status + deduct balance + record approval
    await db`
      UPDATE leave_requests SET status = 'Approved' WHERE id = ${id}
    `;

    const year = new Date(req.start_date).getFullYear();
    await db`
      UPDATE leave_balances
      SET    used_days = used_days + ${req.duration_days}
      WHERE  employee_id = ${req.uid}
        AND  leave_type_id = ${req.leave_type_id}
        AND  year = ${year}
    `;

    await db`
      INSERT INTO approvals (request_id, approver_id, action_taken, remarks)
      VALUES (${id}, ${locals.user.id}, 'Approved', ${remarks || null})
    `;

    return { success: true, action: 'approve' };
  },

  reject: async ({ locals, request }) => {
    const db   = getDb();
    const data = await request.formData();
    const id   = Number(data.get('request_id'));
    const remarks = (data.get('remarks') ?? '').toString().trim();

    if (!id) return fail(400, { error: 'Invalid request.' });

    const updated = await db`
      UPDATE leave_requests SET status = 'Rejected'
      WHERE  id = ${id} AND status = 'Pending'
      RETURNING id
    `;

    if (updated.length === 0) return fail(404, { error: 'Request not found or already processed.' });

    await db`
      INSERT INTO approvals (request_id, approver_id, action_taken, remarks)
      VALUES (${id}, ${locals.user.id}, 'Rejected', ${remarks || null})
    `;

    return { success: true, action: 'reject' };
  }
};
