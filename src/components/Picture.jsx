/* ===========================================================================
   Picture.
   ---------------------------------------------------------------------------
   Takes an extension-less path — '/galleries/duo-shoot-10825/cover' — and
   serves the right file for the browser and the context:

     cover.webp        modern browsers, ~30% smaller
     cover.jpg         universal fallback
     cover-thumb.jpg   grid thumbnails

   When `src` is null it renders the labelled placeholder slot instead, so a
   page ships before its photography exists rather than showing a broken image.
   That is the whole point of the slot pattern — six of the nine galleries are
   currently in exactly that state.
   =========================================================================== */

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

  const suffix = thumb ? '-thumb' : '';

  return (
    <picture className={className} style={ratio ? { aspectRatio: ratio } : undefined} {...rest}>
      {/* Thumbnails only ship a jpg — a second encode of a 640px file saves
          bytes that are not worth the extra build artefact. */}
      {!thumb && <source srcSet={`${src}.webp`} type="image/webp" />}
      <img
        src={`${src}${suffix}.jpg`}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding={eager ? 'sync' : 'async'}
        {...(eager ? { fetchpriority: 'high' } : {})}
      />
    </picture>
  );
}
