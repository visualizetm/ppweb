import { Link } from 'react-router-dom';

/* ===========================================================================
   Wordmark.
   ---------------------------------------------------------------------------
   The logo is rendered AS-IS from the original SVG — a plain <img>, its own
   navy, nothing recoloured, nothing masked, nothing redrawn. An earlier
   version painted it through a CSS mask to force it monochrome; that has been
   removed. The file is used exactly as supplied.

   It sits on a white tile because the mark's own navy needs something to be
   navy against — placed straight onto the near-black canvas it disappears.

   variant="mark"  the logo on its own
   variant="full"  logo plus the typographic name beside it
   variant="type"  name only, no logo
   =========================================================================== */

export default function Wordmark({
  to = '/',
  size = 'md',
  variant = 'type',
  showText = true,
  className = '',
}) {
  const showMark = variant === 'mark' || variant === 'full';
  const showName = (variant === 'type' || variant === 'full') && showText;

  const content = (
    <>
      {showMark && (
        <span className={`wm-tile wm-tile-${size}`}>
          <img src="/brand/logo.svg" alt="" width="100%" height="100%" loading="eager" />
        </span>
      )}
      {showName && (
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

        /* A white tile so the mark's own navy has something to sit against.
           The image itself is untouched. */
        .wm-tile {
          display: grid;
          place-items: center;
          flex: none;
          background: #ffffff;
          border-radius: var(--radius-sm);
          overflow: hidden;
          box-shadow: 0 0 0 1px var(--edge-strong);
          transition: box-shadow var(--duration-fast) var(--ease),
            transform var(--duration-fast) var(--ease);
        }

        /* Sized up per the client's request. */
        .wm-tile-sm { width: 48px; height: 48px; padding: 3px; }
        .wm-tile-md { width: 64px; height: 64px; padding: 4px; }
        .wm-tile-lg { width: 92px; height: 92px; padding: 6px; }

        .wm:hover .wm-tile {
          box-shadow: 0 0 0 1px var(--glass-border-brand),
            0 4px 18px rgba(var(--primer-rgb), 0.3);
          transform: translateY(-1px);
        }

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

        .wm-sm .wm-primary { font-size: 1.15rem; }
        .wm-sm .wm-secondary { font-size: 0.48rem; letter-spacing: 0.16em; }
        .wm-md .wm-primary { font-size: 1.45rem; }
        .wm-md .wm-secondary { font-size: 0.55rem; }
        .wm-lg .wm-primary { font-size: 2.1rem; }
        .wm-lg .wm-secondary { font-size: 0.7rem; }
      `}</style>
    </>
  );
}
