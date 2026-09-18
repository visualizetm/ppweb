/* ===========================================================================
   Client-side image resize.
   ---------------------------------------------------------------------------
   A camera JPEG off a mirrorless body is 20 to 60 MB. A serverless request
   body caps at 4.5 MB. Rather than run a server-side pipeline for this pass,
   the browser does the work: decode, draw to a canvas at a sensible ceiling,
   re-encode as WebP (or JPEG where WebP encoding is unavailable).

   That keeps uploads fast on Michael's connection, keeps the function well
   inside its limits, and means there is no image processing to operate.

   NOT a replacement for scripts/optimize-images.mjs, which still produces the
   three-file webp/jpg/thumb set for anything committed to public/. This is the
   live path for everything uploaded from the dashboard.
   =========================================================================== */

/** Longest edge, in pixels, for a full gallery image. */
const MAX_EDGE = 2400;
/** Longest edge for a cover, which is only ever shown in a card or a banner. */
const MAX_EDGE_COVER = 1800;
const QUALITY = 0.82;

export const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';

/** Reads a File into an ImageBitmap, falling back to an <img> where
    createImageBitmap is missing or refuses the file. */
async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      /* Fall through to the <img> path. */
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('decode_failed'));
      el.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function pickType() {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const webp = canvas.toDataURL('image/webp');
  return webp.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';
}

/**
 * Resizes and re-encodes a File.
 * @returns {Promise<{ blob: Blob, type: string, width: number, height: number }>}
 */
export async function prepareImage(file, { cover = false } = {}) {
  const source = await decode(file);
  const sw = source.width;
  const sh = source.height;
  if (!sw || !sh) throw new Error('That file did not look like an image.');

  const maxEdge = cover ? MAX_EDGE_COVER : MAX_EDGE;
  const scale = Math.min(1, maxEdge / Math.max(sw, sh));
  const width = Math.max(1, Math.round(sw * scale));
  const height = Math.max(1, Math.round(sh * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);
  if (typeof source.close === 'function') source.close();

  const type = pickType();
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('encode_failed'))),
      type,
      QUALITY
    );
  });

  return { blob, type, width, height };
}

/** Human-readable size, for the upload progress line. */
export const formatBytes = (n) => {
  if (!n) return '0 KB';
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};
