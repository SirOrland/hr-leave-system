import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';

let _sql;

export function getDb() {
  if (!_sql) {
    _sql = neon(DATABASE_URL);
  }
  return _sql;
}
