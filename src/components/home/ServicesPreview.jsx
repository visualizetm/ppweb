import { Link } from 'react-router-dom';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Car01 from '@untitled-ui/icons-react/build/esm/Car01';
import Cube02 from '@untitled-ui/icons-react/build/esm/Cube02';
import Users01 from '@untitled-ui/icons-react/build/esm/Users01';
import CalendarHeart01 from '@untitled-ui/icons-react/build/esm/CalendarHeart01';
import User03 from '@untitled-ui/icons-react/build/esm/User03';
import Heart from '@untitled-ui/icons-react/build/esm/Heart';
import Image03 from '@untitled-ui/icons-react/build/esm/Image03';

import { packages } from '../../data/packages';
import { formatMoney } from '../../lib/format';

const ICONS = { Car01, Cube02, Users01, CalendarHeart01, User03, Heart, Image03 };

/* Per-card accent, injected from data via --sc so one CSS block themes them all. */
const ACCENTS = {
  automotive: 'var(--brand)',
  people: 'var(--brand-light)',
  service: 'var(--text-muted)',
};

export default function ServicesPreview() {
  return (
    <>
      <section className="svc section" aria-labelledby="svc-title">
        <div className="wrap">
          <div className="svc-head" data-reveal>
            <div>
              <h2 id="svc-title" className="section-title">
                What I shoot
              </h2>
              <p className="section-subtitle">
                Automotive is the bulk of it, not the limit of it. Every one of these starts with a
                conversation about what you actually want.
              </p>
            </div>
            <Link to="/services" className="btn btn-secondary btn-sm svc-all">
              Services &amp; pricing
              <ArrowRight className="arrow" width={15} height={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="svc-grid" data-reveal="stagger">
            {packages.map((p) => {
              const Icon = ICONS[p.icon] || Car01;
              const cheapest = p.tiers
                .map((t) => t.priceCents)
                .filter((c) => typeof c === 'number')
                .sort((a, b) => a - b)[0];

              return (
                <Link
                  key={p.slug}
                  to={`/services#${p.slug}`}
                  className="svc-card"
                  style={{ '--sc': ACCENTS[p.category] || 'var(--brand)' }}
                >
                  <span className="svc-icon" aria-hidden="true">
                    <Icon width={20} height={20} />
                  </span>
                  <h3 className="svc-name">{p.name}</h3>
                  <p className="svc-tag">{p.tagline}</p>

                  <span className="svc-price">
                    {p.quoteOnly ? (
                      <span className="svc-quote">Quoted individually</span>
                    ) : (
                      <>
                        <span className="svc-from">from</span>
                        {formatMoney(cheapest)}
                        {p.priceIsPlaceholder && (
                          <span className="svc-ph" title="Placeholder price — not yet confirmed">
                            placeholder
                          </span>
                        )}
                      </>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        .svc-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: var(--space-6);
          margin-bottom: var(--space-10);
        }

        .svc-all { flex: none; }

        .svc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
          gap: var(--space-4);
        }

        .svc-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: inherit;
          overflow: hidden;
          transition: transform var(--duration-fast) var(--ease),
            border-color var(--duration-fast) var(--ease),
            box-shadow var(--duration-fast) var(--ease);
        }

        /* Accent bar scales in from the left edge on hover. */
        .svc-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--sc, var(--brand));
          transform: scaleY(0);
          transform-origin: top;
          transition: transform var(--duration) var(--ease);
        }

        .svc-card:hover {
          transform: translateY(-3px);
          border-color: color-mix(in srgb, var(--sc, var(--brand)) 40%, transparent);
          box-shadow: var(--shadow-card-hover);
        }

        .svc-card:hover::before { transform: scaleY(1); }

        .svc-icon {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: var(--radius);
          background: color-mix(in srgb, var(--sc, var(--brand)) 14%, transparent);
          color: var(--sc, var(--brand));
          margin-bottom: var(--space-2);
        }

        .svc-name {
          margin: 0;
          font-size: 1.15rem;
          letter-spacing: 0.02em;
        }

        .svc-tag {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.85rem;
          line-height: 1.55;
          flex: 1;
        }

        .svc-price {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text);
        }

        .svc-from {
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-faint);
        }

        .svc-quote {
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        /* Visible marker so an invented price can never read as a real one.
           Disappears on its own once priceIsPlaceholder is set to false. */
        .svc-ph {
          font-family: var(--font-body);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--warning);
          border: 1px dashed color-mix(in srgb, var(--warning) 50%, transparent);
          border-radius: var(--radius-sm);
          padding: 1px 5px;
        }

        @media (max-width: 768px) {
          .svc-head { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </>
  );
}
