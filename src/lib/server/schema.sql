-- HR Leave and Attendance Management System — Database Schema
-- Run this file against your Neon PostgreSQL database to initialize the schema.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code   VARCHAR(20) UNIQUE NOT NULL,
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   TEXT        NOT NULL,
  role            VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'manager', 'hr_admin')),
  department      VARCHAR(100),
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

-- ============================================================
-- 2. SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT        PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ============================================================
-- 3. DEPARTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id          SERIAL      PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  manager_id  UUID        REFERENCES users(id) ON DELETE SET NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. LEAVE TYPES
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_types (
  id                  SERIAL      PRIMARY KEY,
  name                VARCHAR(50) UNIQUE NOT NULL,
  max_allocation_days INTEGER     NOT NULL DEFAULT 15,
  description         TEXT,
  is_active           BOOLEAN     NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. LEAVE BALANCES (per employee, per leave type, per year)
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_balances (
  id              SERIAL  PRIMARY KEY,
  employee_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leave_type_id   INTEGER NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  year            INTEGER NOT NULL,
  allocated_days  INTEGER NOT NULL DEFAULT 0,
  used_days       INTEGER NOT NULL DEFAULT 0,
  UNIQUE (employee_id, leave_type_id, year)
);

CREATE INDEX IF NOT EXISTS idx_leave_balances_emp ON leave_balances(employee_id, year);

-- ============================================================
-- 6. LEAVE REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id              SERIAL      PRIMARY KEY,
  employee_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leave_type_id   INTEGER     NOT NULL REFERENCES leave_types(id),
  start_date      DATE        NOT NULL,
  end_date        DATE        NOT NULL,
  reason          TEXT        NOT NULL,
  attachment_url  TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  duration_days   INTEGER     GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_lr_employee ON leave_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_lr_status   ON leave_requests(status);

-- ============================================================
-- 7. APPROVALS
-- ============================================================
CREATE TABLE IF NOT EXISTS approvals (
  id               SERIAL      PRIMARY KEY,
  request_id       INTEGER     NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
  approver_id      UUID        NOT NULL REFERENCES users(id),
  action_taken     VARCHAR(20) NOT NULL CHECK (action_taken IN ('Approved', 'Rejected')),
  remarks          TEXT,
  action_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approvals_request ON approvals(request_id);

-- ============================================================
-- 8. ATTENDANCE RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance_records (
  id              SERIAL      PRIMARY KEY,
  employee_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date            DATE        NOT NULL,
  clock_in_time   TIMESTAMPTZ,
  clock_out_time  TIMESTAMPTZ,
  status          VARCHAR(20) NOT NULL DEFAULT 'Present'
                    CHECK (status IN ('Present', 'Late', 'Absent', 'Half Day')),
  location        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, date)
);

CREATE INDEX IF NOT EXISTS idx_att_employee ON attendance_records(employee_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_att_date     ON attendance_records(date DESC);

-- ============================================================
-- FUNCTION: auto-update leave_requests.updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lr_updated_at ON leave_requests;
CREATE TRIGGER trg_lr_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
