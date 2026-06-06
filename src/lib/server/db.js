import { neon } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';

export function getDb() {
  const url = env.DATABASE_URL;
  if (!url || url.includes('placeholder')) {
    throw new Error('DATABASE_URL is not configured. Add it to Vercel Environment Variables.');
  }
  return neon(url);
}
