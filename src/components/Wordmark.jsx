import { Link } from 'react-router-dom';

/* ===========================================================================
   Wordmark.
   ---------------------------------------------------------------------------
   The mark itself is Michael's existing logo SVG, kept exactly as drawn and
   kept in its own navy (#234F96 lives inside the file). It sits in a rounded
   tile so the navy has something to be navy against in both themes — placed
   straight onto the near-black canvas it would disappear.

   The wordmark beside it is set in the display face: condensed, uppercase,
   tightly tracked. "PAPS" carries the weight, "PRODUCTIONS" is the quiet half.
   =========================================================================== */

export default function Wordmark({ to = '/', size = 'md', showText = true, className = '' }) {
  const content = (
    <>
      <span className={`wm-tile wm-tile-${size}`}>
        <img src="/brand/logo.svg" alt="" width="100%" height="100%" />
      </span>
      {showText && (
        <span className="wm-text">
          <span className="wm-primary">Paps</span>
          <span className="wm-secondary">Productions</span>
        </span>
      )}
    </>
  );

  const cls = `wm wm-${size} ${className}`.trim();

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
          color: var(--text);
        }

        .wm-tile {
          display: grid;
          place-items: center;
          flex: none;
          background: #ffffff;
          border-radius: var(--radius-sm);
          overflow: hidden;
          box-shadow: 0 0 0 1px var(--border-light);
          transition: box-shadow var(--duration-fast) var(--ease),
            transform var(--duration-fast) var(--ease);
        }

        .wm-tile-sm { width: 28px; height: 28px; padding: 2px; }
        .wm-tile-md { width: 36px; height: 36px; padding: 3px; }
        .wm-tile-lg { width: 52px; height: 52px; padding: 4px; }

        .wm:hover .wm-tile {
          box-shadow: 0 0 0 1px var(--glass-border-brand),
            0 4px 16px rgba(var(--brand-rgb), 0.28);
        }

        .wm-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
          font-family: var(--font-display);
          text-transform: uppercase;
        }

        .wm-primary {
          font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--text);
        }

        .wm-secondary {
          font-weight: 500;
          color: var(--text-muted);
          letter-spacing: 0.22em;
        }

        .wm-sm .wm-primary { font-size: 0.95rem; }
        .wm-sm .wm-secondary { font-size: 0.5rem; letter-spacing: 0.18em; }
        .wm-md .wm-primary { font-size: 1.2rem; }
        .wm-md .wm-secondary { font-size: 0.58rem; }
        .wm-lg .wm-primary { font-size: 1.75rem; }
        .wm-lg .wm-secondary { font-size: 0.72rem; }
      `}</style>
    </>
  );
}
