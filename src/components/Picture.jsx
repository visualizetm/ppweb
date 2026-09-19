import { useCallback, useState } from 'react';

/* ===========================================================================
   Picture.
   ---------------------------------------------------------------------------
   Handles the two kinds of image this site now has.

   1. UPLOADED (the normal case from here on). A full URL out of Cloudinary,
      already resized and re-encoded by the browser before it was sent. One
      file, one <img>, used exactly as given.

   2. COMMITTED. An extension-less path such as '/galleries/duo-shoot-10825/
      cover', produced by scripts/optimize-images.mjs as a three-file set:

        cover.webp        modern browsers, ~30% smaller
        cover.jpg         universal fallback
        cover-thumb.jpg   grid thumbnails

      These are the originals that shipped with the build. Nothing new arrives
      this way, but the existing gallery covers still do.

   When `src` is empty it renders the labelled placeholder slot instead, so a
   page ships before its photography exists rather than showing a broken image.

   ARRIVAL

   A photograph fades up from the placeholder tone once it has decoded (see
   .pic in index.css) instead of popping in line by line. The class flips on
   the image's load event; an image the browser already had cached fires that
   event before React can listen, so the ref callback checks `complete` and
   flips it straight away. A failed load flips it too, so the alt text is
   never held invisible. Under reduced motion the fade is instant.
   =========================================================================== */

/** A full URL, or any path that already names a file, is used verbatim. */
const isDirect = (src) => /^(https?:)?\/\//i.test(src) || /\.[a-z0-9]{2,5}$/i.test(src);

export default function Picture({
  src,
  alt = '',
  label = 'Photo',
  thumb = false,
  eager = false,
  ratio,
  className = '',
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const done = useCallback(() => setLoaded(true), []);
  const imgRef = useCallback((img) => {
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  if (!src) {
    return (
      <div
        className={`slot ${className}`.trim()}
        data-label={label}
        style={ratio ? { aspectRatio: ratio } : undefined}
        role="img"
        aria-label={`${label} — image not added yet`}
        {...rest}
      />
    );
  }

  const cls = `pic ${loaded ? 'pic-loaded' : ''} ${className}`.trim();
  const imgProps = {
    ref: imgRef,
    alt,
    loading: eager ? 'eager' : 'lazy',
    decoding: eager ? 'sync' : 'async',
    onLoad: done,
    onError: done,
    ...(eager ? { fetchpriority: 'high' } : {}),
  };

  if (isDirect(src)) {
    return (
      <picture className={cls} style={ratio ? { aspectRatio: ratio } : undefined} {...rest}>
        <img src={src} {...imgProps} />
      </picture>
    );
  }

  const suffix = thumb ? '-thumb' : '';

  return (
    <picture className={cls} style={ratio ? { aspectRatio: ratio } : undefined} {...rest}>
      {/* Thumbnails only ship a jpg — a second encode of a 640px file saves
          bytes that are not worth the extra build artefact. */}
      {!thumb && <source srcSet={`${src}.webp`} type="image/webp" />}
      <img src={`${src}${suffix}.jpg`} {...imgProps} />
    </picture>
  );
}
