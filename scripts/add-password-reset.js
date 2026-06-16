import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const db = neon(process.env.DATABASE_URL);

await db`
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token       TEXT        PRIMARY KEY,
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await db`
  CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id)
`;

console.log('password_reset_tokens table created (or already exists).');
