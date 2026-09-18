import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '../../_lib/auth.js';

/* ===========================================================================
   Image upload and removal, backed by Cloudinary.
   ---------------------------------------------------------------------------
   Admin only. POST takes RAW IMAGE BYTES as the body rather than multipart:
   the browser has already resized and re-encoded the file, so there is
   nothing else in the payload. DELETE takes a public_id (or a URL to derive
   it from) and destroys the asset so removed images do not pile up.

   Vercel caps a serverless request body at 4.5 MB. The client resizes to well
   under that before it ever gets here (src/lib/imageResize.js).
   =========================================================================== */

const MAX_BYTES = 4 * 1024 * 1024;
const ROOT_FOLDER = 'papsprod';

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };
const FOLDERS = ['galleries', 'brand', 'about', 'uploads'];

/** Strips anything that could climb out of the folder or confuse a path. */
const slugify = (s, fallback) => {
  const out = String(s ?? '').toLowerCase().replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return out || fallback;
};

/* Either credential style. CLOUDINARY_URL wins; the SDK reads it from the
   environment on its own, so config() only needs to add `secure`. */
export function configure() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    return true;
  }
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (cloud_name && api_key && api_secret) {
    cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    return true;
  }
  return false;
}

/** The public_id inside one of our own delivery URLs, or null for anything
    that is not ours (a /public path, someone else's host, the wrong root). */
export function publicIdFromUrl(url) {
  const m = /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+?)\.[a-z0-9]+$/i.exec(String(url || ''));
  if (!m) return null;
  return m[1].startsWith(`${ROOT_FOLDER}/`) ? m[1] : null;
}

/** Plain-language mapping of a Cloudinary failure, without echoing its body. */
function describe(err) {
  const code = err?.http_code || err?.error?.http_code;
  if (code === 401 || code === 403) return { status: 503, error: 'cloudinary_auth', message: 'Cloudinary rejected the credentials. Check CLOUDINARY_URL or the cloud name, API key and secret in Vercel.' };
  if (code === 420 || code === 429) return { status: 503, error: 'cloudinary_rate_limited', message: 'Cloudinary is rate limiting uploads. Wait a minute and try again.' };
  if (code === 400) return { status: 400, error: 'cloudinary_rejected', message: 'Cloudinary rejected that file. Make sure it is a JPEG, PNG or WebP image.' };
  return { status: 502, error: 'upload_failed', message: 'Image storage did not accept that upload. Try again in a moment.' };
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (!configure()) {
    return res.status(503).json({
      error: 'cloudinary_not_configured',
      message: 'Image storage is not connected yet. Add CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET) to the project in Vercel and redeploy.',
    });
  }

  /* ------------------------------------------------------------ DELETE -- */
  if (req.method === 'DELETE') {
    const given = typeof req.body?.publicId === 'string' ? req.body.publicId : null;
    const publicId = given && given.startsWith(`${ROOT_FOLDER}/`) ? given : publicIdFromUrl(req.body?.url);
    /* Not ours to remove: a local /public path, or a URL from elsewhere. */
    if (!publicId) return res.status(200).json({ ok: true, skipped: 'not_ours' });
    try {
      const r = await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
      return res.status(200).json({ ok: true, result: r?.result || 'ok', publicId });
    } catch (err) {
      const d = describe(err);
      return res.status(d.status).json({ error: d.error, message: d.message });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  /* -------------------------------------------------------------- POST -- */
  const contentType = String(req.headers['content-type'] || '').split(';')[0].trim();
  if (!TYPES[contentType]) {
    return res.status(415).json({ error: 'unsupported_type', message: 'Upload a JPEG, PNG, WebP or AVIF image.' });
  }

  const body = await readBody(req);
  if (!body || !body.length) return res.status(400).json({ error: 'empty_body', message: 'That file came through empty.' });
  if (body.length > MAX_BYTES) {
    return res.status(413).json({ error: 'too_large', message: 'That image is too large even after resizing. Try a smaller original.' });
  }

  const folder = FOLDERS.includes(req.query?.folder) ? req.query.folder : 'uploads';
  const name = slugify(req.query?.name, 'image');
  /* Our own suffix so two uploads of "cover" never overwrite each other; the
     old one may still be the published version. */
  const suffix = Math.random().toString(36).slice(2, 8);

  try {
    const result = await cloudinary.uploader.upload(`data:${contentType};base64,${body.toString('base64')}`, {
      folder: `${ROOT_FOLDER}/${folder}`,
      public_id: `${name}-${suffix}`,
      resource_type: 'image',
      overwrite: false,
    });

    return res.status(200).json({
      ok: true,
      url: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes || body.length,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    const d = describe(err);
    return res.status(d.status).json({ error: d.error, message: d.message });
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
