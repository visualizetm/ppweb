import { useState } from 'react';

import Seo from '../components/Seo';
import GalleryCard, { galleryCardStyles } from '../components/GalleryCard';
import { galleries, galleryTypes, galleriesByType } from '../data/galleries';

export default function Portfolio() {
  const [type, setType] = useState('All');
  const shown = galleriesByType(type);

  return (
    <>
      <Seo
        title="Portfolio"
        description="Automotive photography galleries by Paps Productions — solo, duo, group and event coverage across Delaware County and Philadelphia."
      />

      <section className="pf-hero texture-trails">
        <div className="wrap">
          <span className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            {galleries.length} galleries
          </span>
          <h1 className="pf-title display">Portfolio</h1>
          <p className="section-subtitle">
            Every shoot gets its own gallery. Solo cars, pairs, group sessions and full event
            coverage.
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="wrap">
          <div className="pf-filters" role="group" aria-label="Filter galleries by type">
            {galleryTypes.map((t) => (
              <button
                key={t}
                type="button"
                className={`pf-filter ${t === type ? 'pf-filter-on' : ''}`}
                onClick={() => setType(t)}
                aria-pressed={t === type}
              >
                {t}
                <span className="pf-count">
                  {t === 'All' ? galleries.length : galleries.filter((g) => g.type === t).length}
                </span>
              </button>
            ))}
          </div>

          <p className="pf-status" role="status">
            Showing {shown.length} of {galleries.length} galleries
          </p>

          <div className="pf-grid" data-reveal="stagger">
            {shown.map((g, i) => (
              <GalleryCard key={g.slug} gallery={g} eager={i < 3} />
            ))}
          </div>
        </div>
      </section>

      <style>{`
        ${galleryCardStyles}

        .pf-hero {
          padding-block: var(--space-16) var(--space-10);
        }

        .pf-title {
          font-size: clamp(2.5rem, 8vw, 4.5rem);
          margin: 0 0 var(--space-4);
        }

        .pf-filters {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-bottom: var(--space-6);
        }

        .pf-filter {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-pill);
          border: 1px solid var(--border-light);
          background: var(--glass-bg);
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
          transition: background-color var(--duration-fast) var(--ease),
            color var(--duration-fast) var(--ease),
            border-color var(--duration-fast) var(--ease);
        }

        .pf-filter:hover { color: var(--text); border-color: var(--glass-border-brand); }

        .pf-filter-on {
          background: var(--brand);
          border-color: var(--brand);
          color: #06090f;
        }

        .pf-count {
          font-size: 0.7rem;
          font-weight: 700;
          opacity: 0.7;
          font-variant-numeric: tabular-nums;
        }

        .pf-status {
          margin: 0 0 var(--space-6);
          font-size: 0.78rem;
          color: var(--text-faint);
        }

        .pf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-6);
        }
      `}</style>
    </>
  );
}
