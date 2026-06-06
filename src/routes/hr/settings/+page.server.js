import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';
import { hashPassword } from '$lib/server/auth.js';

export async function load() {
  const db = getDb();

  const [users, departments, leaveTypes] = await Promise.all([
    db`
      SELECT id, employee_code, name, email, role, department, is_active, created_at
      FROM   users
      ORDER  BY created_at DESC
    `,
    db`SELECT * FROM departments ORDER BY name`,
    db`SELECT * FROM leave_types ORDER BY name`
  ]);

  return { users, departments, leaveTypes };
}

export const actions = {

  // ---- USER ACTIONS ----
  createUser: async ({ request }) => {
    const db   = getDb();
    const data = await request.formData();
    const name       = (data.get('name')       ?? '').toString().trim();
    const email      = (data.get('email')      ?? '').toString().trim().toLowerCase();
    const role       = (data.get('role')       ?? '').toString();
    const department = (data.get('department') ?? '').toString().trim();
    const password   = (data.get('password')   ?? '').toString();

    if (!name || !email || !role || !password) {
      return fail(400, { tab: 'users', userError: 'All fields are required.' });
    }
    if (password.length < 8) {
      return fail(400, { tab: 'users', userError: 'Password must be at least 8 characters.' });
    }
    if (!['employee', 'manager', 'hr_admin'].includes(role)) {
      return fail(400, { tab: 'users', userError: 'Invalid role.' });
    }

    // Generate employee code
    const maxCode = await db`
      SELECT employee_code FROM users ORDER BY created_at DESC LIMIT 1
    `;
    const lastNum = maxCode.length > 0
      ? parseInt(maxCode[0].employee_code.replace('EMP-', ''), 10)
      : 0;
    const empCode = `EMP-${String(lastNum + 1).padStart(4, '0')}`;

    try {
      const hash = await hashPassword(password);
      await db`
        INSERT INTO users (employee_code, name, email, password_hash, role, department)
        VALUES (${empCode}, ${name}, ${email}, ${hash}, ${role}, ${department || null})
      `;
    } catch (err) {
      if (err.code === '23505') {
        return fail(409, { tab: 'users', userError: 'A user with this email already exists.' });
      }
      throw err;
    }

    // Initialize leave balances for the new employee
    if (role === 'employee') {
      const year = new Date().getFullYear();
      const lts  = await db`SELECT id, max_allocation_days FROM leave_types WHERE is_active = true`;
      const newUser = await db`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
      if (newUser.length > 0) {
        for (const lt of lts) {
          await db`
            INSERT INTO leave_balances (employee_id, leave_type_id, year, allocated_days, used_days)
            VALUES (${newUser[0].id}, ${lt.id}, ${year}, ${lt.max_allocation_days}, 0)
            ON CONFLICT DO NOTHING
          `;
        }
      }
    }

    return { success: true, action: 'createUser', tab: 'users' };
  },

  toggleUser: async ({ request }) => {
    const db   = getDb();
    const data = await request.formData();
    const id   = data.get('user_id')?.toString();
    if (!id) return fail(400, { tab: 'users', userError: 'Invalid user.' });

    await db`UPDATE users SET is_active = NOT is_active WHERE id = ${id}`;
    return { success: true, action: 'toggleUser', tab: 'users' };
  },

  editUser: async ({ request }) => {
    const db   = getDb();
    const data = await request.formData();
    const id         = data.get('user_id')?.toString();
    const name       = (data.get('name')       ?? '').toString().trim();
    const role       = (data.get('role')       ?? '').toString();
    const department = (data.get('department') ?? '').toString().trim();

    if (!id || !name || !role) return fail(400, { tab: 'users', userError: 'Missing fields.' });

    await db`
      UPDATE users SET name = ${name}, role = ${role}, department = ${department || null}
      WHERE id = ${id}
    `;
    return { success: true, action: 'editUser', tab: 'users' };
  },

  // ---- DEPARTMENT ACTIONS ----
  createDept: async ({ request }) => {
    const db   = getDb();
    const data = await request.formData();
    const name = (data.get('name') ?? '').toString().trim();
    const desc = (data.get('description') ?? '').toString().trim();
    if (!name) return fail(400, { tab: 'departments', deptError: 'Department name is required.' });

    try {
      await db`INSERT INTO departments (name, description) VALUES (${name}, ${desc || null})`;
    } catch (err) {
      if (err.code === '23505') return fail(409, { tab: 'departments', deptError: 'Department already exists.' });
      throw err;
    }
    return { success: true, action: 'createDept', tab: 'departments' };
  },

  deleteDept: async ({ request }) => {
    const db   = getDb();
    const data = await request.formData();
    const id   = Number(data.get('dept_id'));
    if (!id) return fail(400, { tab: 'departments', deptError: 'Invalid dept.' });
    await db`DELETE FROM departments WHERE id = ${id}`;
    return { success: true, action: 'deleteDept', tab: 'departments' };
  },

  // ---- LEAVE TYPE ACTIONS ----
  createLeaveType: async ({ request }) => {
    const db   = getDb();
    const data = await request.formData();
    const name  = (data.get('name')  ?? '').toString().trim();
    const days  = Number(data.get('max_days') ?? 0);
    const desc  = (data.get('description') ?? '').toString().trim();
    if (!name || !days) return fail(400, { tab: 'leaveTypes', ltError: 'Name and max days are required.' });

    try {
      await db`INSERT INTO leave_types (name, max_allocation_days, description) VALUES (${name}, ${days}, ${desc || null})`;
    } catch (err) {
      if (err.code === '23505') return fail(409, { tab: 'leaveTypes', ltError: 'Leave type already exists.' });
      throw err;
    }
    return { success: true, action: 'createLeaveType', tab: 'leaveTypes' };
  },

  editLeaveType: async ({ request }) => {
    const db   = getDb();
    const data = await request.formData();
    const id   = Number(data.get('lt_id'));
    const days = Number(data.get('max_days'));
    if (!id || !days) return fail(400, { tab: 'leaveTypes', ltError: 'Invalid data.' });
    await db`UPDATE leave_types SET max_allocation_days = ${days} WHERE id = ${id}`;
    return { success: true, action: 'editLeaveType', tab: 'leaveTypes' };
  },

  toggleLeaveType: async ({ request }) => {
    const db   = getDb();
    const data = await request.formData();
    const id   = Number(data.get('lt_id'));
    if (!id) return fail(400);
    await db`UPDATE leave_types SET is_active = NOT is_active WHERE id = ${id}`;
    return { success: true, action: 'toggleLeaveType', tab: 'leaveTypes' };
  }
};
