import { getDb } from '$lib/server/db.js';

/** GET /api/attachment?id=<leave_request_id>
 *  Streams the attachment for a leave request back as the real file type.
 *  Accessible to managers and hr_admins only.
 */
export async function GET({ locals, url }) {
  const user = locals.user;
  if (!user || !['manager', 'hr_admin'].includes(user.role)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const id = Number(url.searchParams.get('id'));
  if (!id) return new Response('Missing id', { status: 400 });

  const db   = getDb();
  const rows = await db`
    SELECT attachment_url FROM leave_requests WHERE id = ${id} LIMIT 1
  `;

  if (!rows.length || !rows[0].attachment_url) {
    return new Response('No attachment found', { status: 404 });
  }

  const dataUrl = rows[0].attachment_url;
  const match   = dataUrl.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) {
    return new Response('Invalid attachment data', { status: 500 });
  }

  const [, mimeType, b64] = match;
  const buffer = Buffer.from(b64, 'base64');

  const ext = mimeType === 'application/pdf' ? 'pdf'
    : mimeType === 'image/jpeg' ? 'jpg'
    : mimeType === 'image/png'  ? 'png'
    : mimeType === 'image/webp' ? 'webp'
    : 'doc';

  const disposition = ['image/jpeg','image/png','image/webp','application/pdf'].includes(mimeType)
    ? 'inline'
    : 'attachment';

  return new Response(buffer, {
    headers: {
      'Content-Type':        mimeType,
      'Content-Length':      String(buffer.length),
      'Content-Disposition': `${disposition}; filename="attachment.${ext}"`,
      'Cache-Control':       'private, max-age=3600'
    }
  });
}
