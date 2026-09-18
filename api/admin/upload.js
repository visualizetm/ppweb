import { put, del } from '@vercel/blob';
import { requireAdmin } from '../_lib/auth';

/* ===========================================================================
   Image upload.
   ---------------------------------------------------------------------------
   Admin only. Takes RAW IMAGE BYTES as the request body rather than multipart:
   the browser has already resized and re-encoded the file, so there is nothing
   else in the payload and multipart would only add a parser to get wrong.

   Vercel caps a serverless request body at 4.5 MB. The client resizes to well
   under that before it ever gets here (see src/lib/imageResize.js), and the
   check below turns the platform's opaque failure into a readable message.
   =========================================================================== */

const MAX_BYTES = 4 * 1024 * 1024;

const TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

const FOLDERS = ['galleries', 'brand', 'about', 'uploads'];

/** Strips anything that could climb out of the folder or confuse a CDN path. */
const slugify = (s, fallback) => {
  const out = String(s ?? '')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return out || fallback;
};

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      error: 'blob_not_configured',
      message:
        'Image storage is not connected yet. Add a Blob store to this project in Vercel and redeploy.',
    });
  }

  /* ------------------------------------------------------------ DELETE -- */
  if (req.method === 'DELETE') {
    const url = req.body?.url;
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url_required' });
    /* Only ever deletes from our own store. A URL pointing anywhere else is
       either a local /public path or someone else's file; neither is ours to
       remove, and both are a no-op rather than an error. */
    if (!/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(url)) {
      return res.status(200).json({ ok: true, skipped: 'not_a_blob_url' });
    }
    try {
      await del(url);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(200).json({ ok: true, skipped: 'already_gone' });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  /* -------------------------------------------------------------- POST -- */
  const contentType = String(req.headers['content-type'] || '').split(';')[0].trim();
  const ext = TYPES[contentType];
  if (!ext) {
    return res.status(415).json({
      error: 'unsupported_type',
      message: 'Upload a JPEG, PNG, WebP or AVIF image.',
    });
  }

  const body = await readBody(req);
  if (!body || !body.length) {
    return res.status(400).json({ error: 'empty_body', message: 'That file came through empty.' });
  }
  if (body.length > MAX_BYTES) {
    return res.status(413).json({
      error: 'too_large',
      message: 'That image is too large even after resizing. Try a smaller original.',
    });
  }

  const folder = FOLDERS.includes(req.query?.folder) ? req.query.folder : 'uploads';
  const name = slugify(req.query?.name, 'image');
  /* addRandomSuffix keeps two uploads of "cover.jpg" from overwriting each
     other, which matters because replacing a gallery cover is a common action
     and the old one may still be the published version. */
  const pathname = `${folder}/${name}.${ext}`;

  try {
    const blob = await put(pathname, body, {
      access: 'public',
      contentType,
      addRandomSuffix: true,
      cacheControlMaxAge: 31536000,
    });

    return res.status(200).json({
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
      bytes: body.length,
    });
  } catch (err) {
    return res.status(502).json({
      error: 'upload_failed',
      message: 'Image storage rejected that upload. Try again in a moment.',
    });
  }
}

/* Vercel hands most bodies over pre-parsed, but an image/* body arrives as a
   Buffer on some runtimes and as an unread stream on others. Handle both. */
async function readBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body, 'binary');

  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BYTES) return Buffer.alloc(MAX_BYTES + 1);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
