#!/usr/bin/env node
/**
 * Adds AM/PM time-in/time-out columns to attendance_records.
 * Run: node scripts/migrate-am-pm.js
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

console.log('Adding AM/PM columns…');
await pool.query(`
  ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS am_in  TIMESTAMPTZ;
  ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS am_out TIMESTAMPTZ;
  ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS pm_in  TIMESTAMPTZ;
  ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS pm_out TIMESTAMPTZ;
`);

console.log('Migrating existing clock_in/clock_out → am_in/pm_out…');
await pool.query(`
  UPDATE attendance_records
  SET am_in  = clock_in_time,
      pm_out = clock_out_time
  WHERE clock_in_time IS NOT NULL AND am_in IS NULL;
`);

await pool.end();
console.log('Done.');
