#!/usr/bin/env node
/**
 * Initializes the Neon PostgreSQL schema.
 * Run: node scripts/setup-db.js
 * Requires .env with DATABASE_URL set.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;

const __dir = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(__dir, '../src/lib/server/schema.sql'), 'utf8');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

console.log('Running schema…');
try {
  await pool.query(schema);
  console.log('Schema setup complete.');
} catch (err) {
  console.error('Schema error:', err.message);
} finally {
  await pool.end();
}
