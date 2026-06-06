#!/usr/bin/env node
/**
 * Seeds the database with demo data.
 * Run AFTER setup-db.js: node scripts/seed.js
 *
 * Demo accounts:
 *   HR Admin  — admin@hrms.com     / Admin@1234
 *   Manager   — manager@hrms.com   / Manager@1234
 *   Employee  — jane@hrms.com      / Employee@1234
 *   Employee  — john@hrms.com      / Employee@1234
 */
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function hash(plain) {
  return bcrypt.hash(plain, 12);
}

console.log('Seeding database…');

// --- Departments ---
await sql`
  INSERT INTO departments (name, description) VALUES
    ('Engineering',   'Software development and infrastructure'),
    ('Human Resources','People operations and talent management'),
    ('Operations',    'Business operations and project management'),
    ('Finance',       'Accounting, payroll, and budgeting')
  ON CONFLICT (name) DO NOTHING
`;
console.log('✓ Departments');

// --- Leave Types ---
await sql`
  INSERT INTO leave_types (name, max_allocation_days, description) VALUES
    ('Annual Leave',    15, 'Standard paid annual leave'),
    ('Sick Leave',      10, 'Paid sick and medical leave'),
    ('Emergency Leave',  5, 'Urgent personal or family emergencies')
  ON CONFLICT (name) DO NOTHING
`;
console.log('✓ Leave Types');

// --- Users ---
const [adminHash, managerHash, empHash] = await Promise.all([
  hash('Admin@1234'),
  hash('Manager@1234'),
  hash('Employee@1234')
]);

const users = await sql`
  INSERT INTO users (employee_code, name, email, password_hash, role, department) VALUES
    ('EMP-0001', 'Alex Rivera',   'admin@hrms.com',   ${adminHash},   'hr_admin', 'Human Resources'),
    ('EMP-0002', 'Morgan Chen',   'manager@hrms.com', ${managerHash}, 'manager',  'Engineering'),
    ('EMP-0003', 'Sarah Jane',    'jane@hrms.com',    ${empHash},     'employee', 'Engineering'),
    ('EMP-0004', 'John Doe',      'john@hrms.com',    ${empHash},     'employee', 'Operations')
  ON CONFLICT (email) DO NOTHING
  RETURNING id, name, email
`;
console.log('✓ Users:', users.map(u => u.email).join(', '));

// --- Leave Balances (current year) ---
const year = new Date().getFullYear();
const leaveTypes = await sql`SELECT id FROM leave_types`;
const empUsers   = await sql`SELECT id FROM users WHERE role = 'employee'`;

for (const emp of empUsers) {
  for (const lt of leaveTypes) {
    const alloc = lt.id === 1 ? 15 : lt.id === 2 ? 10 : 5;
    await sql`
      INSERT INTO leave_balances (employee_id, leave_type_id, year, allocated_days, used_days)
      VALUES (${emp.id}, ${lt.id}, ${year}, ${alloc}, 0)
      ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING
    `;
  }
}
console.log('✓ Leave Balances');

// --- Sample Leave Request ---
const janeRow = await sql`SELECT id FROM users WHERE email = 'jane@hrms.com' LIMIT 1`;
if (janeRow.length > 0) {
  const janeId = janeRow[0].id;
  await sql`
    INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, reason, status)
    VALUES
      (${janeId}, 1, CURRENT_DATE + 5, CURRENT_DATE + 9, 'Family vacation', 'Pending'),
      (${janeId}, 2, CURRENT_DATE - 10, CURRENT_DATE - 8, 'Flu recovery', 'Approved')
    ON CONFLICT DO NOTHING
  `;
  // Reflect approved request in balance
  await sql`
    UPDATE leave_balances
    SET used_days = used_days + 3
    WHERE employee_id = ${janeId}
      AND leave_type_id = 2
      AND year = ${year}
  `;
}
console.log('✓ Sample Leave Requests');

// --- Sample Attendance ---
const allEmps = await sql`SELECT id FROM users WHERE role IN ('employee', 'manager')`;
for (const emp of allEmps) {
  await sql`
    INSERT INTO attendance_records (employee_id, date, clock_in_time, clock_out_time, status, location)
    VALUES (
      ${emp.id}, CURRENT_DATE,
      NOW() - INTERVAL '3 hours',
      NULL,
      'Present',
      'Office — Main Campus'
    )
    ON CONFLICT (employee_id, date) DO NOTHING
  `;
}
console.log('✓ Sample Attendance');

console.log('\nSeed complete! Login credentials:');
console.log('  HR Admin  → admin@hrms.com    / Admin@1234');
console.log('  Manager   → manager@hrms.com  / Manager@1234');
console.log('  Employee  → jane@hrms.com     / Employee@1234');
