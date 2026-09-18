import { Link } from 'react-router-dom';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';

import { useContent } from '../lib/useContent';

/* ===========================================================================
   Announcement bar.
   ---------------------------------------------------------------------------
   Sits above the nav on every marketing page. Renders nothing at all unless
   `enabled` is true AND there is a message, so an empty draft cannot leave a
   blank strip across the top of the site.

   Three tones, drawn from the existing palette tokens rather than a colour
   picker. A free-form colour field is how a site ends up with an unreadable
   announcement bar; these three are all contrast-checked.
   =========================================================================== */

const TONES = ['accent', 'neutral', 'alert'];

export default function AnnouncementBar() {
  const { enabled, message, linkText, linkUrl, tone } = useContent('announcement');

  const text = String(message || '').trim();
  if (!enabled || !text) return null;

  const safeTone = TONES.includes(tone) ? tone : 'accent';
  const label = String(linkText || '').trim();
  const href = String(linkUrl || '').trim();
  const showLink = Boolean(label && href);
  const external = /^https?:\/\//i.test(href);

  return (
    <>
      <aside className="ab" data-tone={safeTone} aria-label="Site announcement">
        <div className="ab-inner">
          <p className="ab-text">{text}</p>

          {showLink &&
            (external ? (
              <a className="ab-link" href={href} target="_blank" rel="noreferrer noopener">
                {label}
                <ArrowRight className="arrow" width={14} height={14} aria-hidden="true" />
              </a>
            ) : (
              <Link className="ab-link" to={href}>
                {label}
                <ArrowRight className="arrow" width={14} height={14} aria-hidden="true" />
              </Link>
            ))}
        </div>
      </aside>

      <style>{`
        .ab {
          position: relative;
          z-index: 90;
          border-bottom: 1px solid var(--border);
        }

        .ab-inner {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: var(--space-2) var(--space-4);
          max-width: var(--max-width);
          margin: 0 auto;
          padding: var(--space-3) var(--space-5);
          text-align: center;
        }

        .ab-text {
          margin: 0;
          font-size: 0.85rem;
          line-height: 1.5;
          font-weight: 500;
        }

        .ab-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
        }

        .ab-link .arrow {
          transition: transform var(--duration-fast) var(--ease);
        }

        .ab-link:hover .arrow { transform: translateX(3px); }

        /* --- tones ---------------------------------------------------- */

        /* Every pair below is one scripts/check-contrast.mjs already verifies,
           which is why there are three tones and not a colour picker. */

        .ab[data-tone='accent'] {
          background: var(--primer);
          border-bottom-color: var(--primer-edge);
        }
        .ab[data-tone='accent'] .ab-text,
        .ab[data-tone='accent'] .ab-link { color: var(--on-primer); }

        .ab[data-tone='neutral'] {
          background: var(--panel-high);
        }
        .ab[data-tone='neutral'] .ab-text { color: var(--ink-soft); }
        .ab[data-tone='neutral'] .ab-link { color: var(--ink); }

        .ab[data-tone='alert'] {
          background: var(--alert-tint);
          border-bottom-color: var(--alert-ink);
        }
        .ab[data-tone='alert'] .ab-text,
        .ab[data-tone='alert'] .ab-link { color: var(--alert-ink); }

        @media (max-width: 560px) {
          .ab-inner { padding-inline: var(--space-4); }
          .ab-text { font-size: 0.8rem; }
        }
      `}</style>
    </>
  );
}
