#!/usr/bin/env node
/**
 * Initializes the Neon PostgreSQL schema.
 * Run: node scripts/setup-db.js
 * Requires .env with DATABASE_URL set.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const __dir = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dir, '../src/lib/server/schema.sql');
const schema = readFileSync(schemaPath, 'utf8');

const sql = neon(process.env.DATABASE_URL);

// Split on semicolons and execute each statement
const stmts = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 10);

console.log(`Executing ${stmts.length} SQL statements…`);

for (const stmt of stmts) {
  try {
    await sql.unsafe(stmt + ';');
    process.stdout.write('.');
  } catch (err) {
    console.error('\nFailed statement:', stmt.slice(0, 80));
    console.error(err.message);
  }
}

console.log('\nSchema setup complete.');
