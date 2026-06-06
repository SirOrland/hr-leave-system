import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';

/** PATCH /api/leave/[id] — approve or reject a leave request (manager/hr_admin) */
export async function PATCH({ locals, params, request }) {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const allowed = ['manager', 'hr_admin'];
  if (!allowed.includes(locals.user.role)) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }

  const db       = getDb();
  const id       = Number(params.id);
  const body     = await request.json().catch(() => ({}));
  const action   = body.action;   // 'Approved' | 'Rejected'
  const remarks  = body.remarks ?? null;

  if (!['Approved', 'Rejected'].includes(action)) {
    return json({ error: 'action must be Approved or Rejected' }, { status: 400 });
  }

  const rows = await db`
    SELECT * FROM leave_requests WHERE id = ${id} AND status = 'Pending' LIMIT 1
  `;

  if (rows.length === 0) return json({ error: 'Not found or already processed' }, { status: 404 });
  const req = rows[0];

  // Update status
  await db`UPDATE leave_requests SET status = ${action} WHERE id = ${id}`;

  // Deduct balance on approval
  if (action === 'Approved') {
    const year = new Date(req.start_date).getFullYear();
    await db`
      UPDATE leave_balances
      SET    used_days = used_days + ${req.duration_days}
      WHERE  employee_id   = ${req.employee_id}
        AND  leave_type_id = ${req.leave_type_id}
        AND  year          = ${year}
    `;
  }

  // Record approval
  await db`
    INSERT INTO approvals (request_id, approver_id, action_taken, remarks)
    VALUES (${id}, ${locals.user.id}, ${action}, ${remarks})
  `;

  return json({ success: true, action });
}

/** GET /api/leave/[id] — get single request details */
export async function GET({ locals, params }) {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const db  = getDb();
  const id  = Number(params.id);

  const rows = await db`
    SELECT lr.*, lt.name AS leave_type, u.name AS employee_name
    FROM   leave_requests lr
    JOIN   leave_types lt ON lt.id = lr.leave_type_id
    JOIN   users       u  ON u.id  = lr.employee_id
    WHERE  lr.id = ${id}
      AND (lr.employee_id = ${locals.user.id} OR ${locals.user.role} IN ('manager', 'hr_admin'))
    LIMIT 1
  `;

  if (rows.length === 0) return json({ error: 'Not found' }, { status: 404 });
  return json(rows[0]);
}
