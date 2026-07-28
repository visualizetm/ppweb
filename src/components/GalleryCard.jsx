import { Link } from 'react-router-dom';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';
import AlertCircle from '@untitled-ui/icons-react/build/esm/AlertCircle';

import Picture from './Picture';
import { isDemo } from '../lib/dataSource';

/* ===========================================================================
   Gallery card.
   ---------------------------------------------------------------------------
   Shared by the Portfolio index and the homepage feature strip so the two can
   never drift apart. The style block is exported alongside it for the same
   reason — one definition, two mount points.
   =========================================================================== */

export default function GalleryCard({ gallery, eager = false, featured = false }) {
  const { slug, title, caption, dateLabel, type, cover, coverAlt, dateDisputed } = gallery;

  return (
    <Link to={`/portfolio/${slug}`} className={`gc ${featured ? 'gc-featured' : ''}`}>
      <span className="gc-media">
        <Picture
          src={cover}
          alt={coverAlt || `${title} — ${caption}`}
          label={`${title} cover`}
          eager={eager}
          thumb={!featured}
          ratio="3 / 2"
          className="gc-img"
        />
        <span className="gc-type">{type}</span>
      </span>

      <span className="gc-body">
        <span className="gc-head">
          <h3 className="gc-title">{title}</h3>
          {dateLabel && <span className="gc-date">{dateLabel}</span>}
        </span>

        {/* A descriptive line, not a bare date — a date tells a visitor nothing
            about whether they want to open it. */}
        <span className="gc-caption">{caption}</span>

        {/* Only surfaced in the demo: an unresolved data conflict Michael needs
            to settle. It disappears in production along with everything else
            behind isDemo. */}
        {isDemo && dateDisputed && (
          <span className="gc-flag">
            <AlertCircle width={13} height={13} aria-hidden="true" />
            Date needs confirming
          </span>
        )}

        <span className="gc-more">
          View gallery
          <ArrowRight className="arrow" width={14} height={14} aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}

export const galleryCardStyles = `
  .gc {
    display: flex;
    flex-direction: column;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    background: var(--bg-card);
    overflow: hidden;
    color: inherit;
    transition: transform var(--duration-fast) var(--ease),
      border-color var(--duration-fast) var(--ease),
      box-shadow var(--duration-fast) var(--ease);
  }

  .gc:hover {
    transform: translateY(-3px);
    border-color: var(--glass-border-brand);
    box-shadow: var(--shadow-card-hover);
  }

  .gc-media {
    position: relative;
    display: block;
    overflow: hidden;
    background: var(--surface);
  }

  .gc-img,
  .gc-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .gc-img { aspect-ratio: 3 / 2; }

  .gc .gc-img img {
    transition: transform var(--duration-slow) var(--ease-out);
  }

  .gc:hover .gc-img img { transform: scale(1.04); }

  .gc-type {
    position: absolute;
    top: var(--space-3);
    left: var(--space-3);
    padding: 3px var(--space-3);
    border-radius: var(--radius-pill);
    background: var(--chrome-solid);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .gc-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-5);
    flex: 1;
  }

  .gc-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .gc-title {
    margin: 0;
    font-size: 1.25rem;
    letter-spacing: 0.02em;
    color: var(--text);
  }

  .gc-date {
    flex: none;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--text-faint);
    font-variant-numeric: tabular-nums;
  }

  .gc-caption {
    color: var(--text-muted);
    font-size: 0.88rem;
    line-height: 1.6;
  }

  .gc-flag {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    align-self: flex-start;
    padding: 2px var(--space-2);
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--warning) 14%, transparent);
    color: var(--warning);
    font-size: 0.68rem;
    font-weight: 600;
  }

  .gc-more {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: auto;
    padding-top: var(--space-3);
    color: var(--brand-ink);
    font-size: 0.82rem;
    font-weight: 600;
  }

  .gc-featured .gc-title { font-size: 1.4rem; }
`;
