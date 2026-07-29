import { Link } from 'react-router-dom';

/* ===========================================================================
   Wordmark.
   ---------------------------------------------------------------------------
   The mark is Michael's existing logo, same glyph, rendered MONOCHROME.

   The source SVG is filled #234F96 navy. Direction B's whole argument is that
   the chrome carries no colour of its own — colour belongs to the photographs
   — so a navy tile in the navbar would be the one thing on the page
   contradicting the thesis. Instead the SVG is used as a CSS mask and painted
   in currentColor, so it reads as a stamped plate and inherits the ink of
   whatever theme it sits in.

   This is a mask, not an <img>, which is why the file's own fill colour stops
   mattering. If Michael later supplies a mark with transparency or multiple
   colours, the mask still works — it keys on alpha, not on hue.

   TWO VARIANTS, AND WHY

   The existing logo is not a monogram — it is a camera-body sticker with
   "PAPS" in rounded graffiti lettering and "PRODUCTIONS" beneath. It already
   contains the name. So setting it next to a typographic wordmark says the
   name twice, and at navbar size the lettering collapses into an unreadable
   blob.

     variant="type"  typographic only. Used in the navbar, where legibility at
                     26px matters more than personality.
     variant="mark"  the real logo. Used in the footer at a size where it can
                     actually be read, and as the favicon.

   Worth saying plainly: the sticker style suits vinyl on a rear window and an
   Instagram avatar — which is where a car photographer actually uses a mark —
   but it pulls against this site's stamped, industrial type. Michael may want
   a second, simpler mark for screen use. Flagged, not decided.
   =========================================================================== */

export default function Wordmark({
  to = '/',
  size = 'md',
  variant = 'type',
  showText = true,
  className = '',
}) {
  const content = (
    <>
      {variant === 'mark' && <span className={`wm-mark wm-mark-${size}`} role="presentation" />}
      {variant === 'type' && showText && (
        <span className="wm-text">
          <span className="wm-primary">Paps</span>
          <span className="wm-secondary">Productions</span>
        </span>
      )}
    </>
  );

  const cls = `wm wm-${size} wm-${variant} ${className}`.trim();

  return (
    <>
      {to ? (
        <Link to={to} className={cls} aria-label="Paps Productions — home">
          {content}
        </Link>
      ) : (
        <span className={cls}>{content}</span>
      )}

      <style>{`
        .wm {
          display: inline-flex;
          align-items: center;
          gap: var(--space-3);
          text-decoration: none;
          color: var(--ink);
        }

        /* The glyph, painted rather than embedded. */
        .wm-mark {
          display: block;
          flex: none;
          background-color: currentColor;
          -webkit-mask-image: url('/brand/logo.svg');
          mask-image: url('/brand/logo.svg');
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-position: center;
          mask-position: center;
          -webkit-mask-size: contain;
          mask-size: contain;
          transition: opacity var(--duration-fast) var(--ease);
        }

        /* Sized so the lettering inside the mark stays readable. Below about
           64px wide this logo is mush, which is why the navbar does not use it. */
        .wm-mark-sm { width: 72px; height: 72px; }
        .wm-mark-md { width: 92px; height: 92px; }
        .wm-mark-lg { width: 116px; height: 116px; }

        .wm:hover .wm-mark { opacity: 0.7; }

        .wm-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
          font-family: var(--font-display);
          text-transform: uppercase;
        }

        .wm-primary {
          font-variation-settings: 'wdth' var(--wdth-plate);
          font-weight: 800;
          letter-spacing: -0.005em;
          color: var(--ink);
        }

        /* Set in the utility face — it reads as a stamped sub-line on a plate
           rather than a second helping of display type. */
        .wm-secondary {
          font-family: var(--font-mono);
          font-weight: 500;
          color: var(--ink-soft);
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .wm-sm .wm-primary { font-size: 0.95rem; }
        .wm-sm .wm-secondary { font-size: 0.48rem; letter-spacing: 0.16em; }
        .wm-md .wm-primary { font-size: 1.15rem; }
        .wm-md .wm-secondary { font-size: 0.55rem; }
        .wm-lg .wm-primary { font-size: 1.7rem; }
        .wm-lg .wm-secondary { font-size: 0.7rem; }
      `}</style>
    </>
  );
}
