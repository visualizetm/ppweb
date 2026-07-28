import { Link } from 'react-router-dom';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Image03 from '@untitled-ui/icons-react/build/esm/Image03';

import Picture from '../Picture';
import { galleries } from '../../data/galleries';
import { site } from '../../data/site';

/* Counts come from the data, so they cannot go stale when a gallery is added. */
const STATS = [
  { num: String(galleries.length), label: 'Galleries' },
  { num: new Set(galleries.map((g) => g.type)).size.toString(), label: 'Shoot types' },
  { num: '2025', label: 'Shooting since' }, // PLACEHOLDER — confirm with Michael
];

export default function Hero() {
  return (
    <>
      <section className="hero texture-trails" aria-labelledby="hero-title">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              {site.serviceArea.baseShort}
            </span>

            <h1 id="hero-title" className="hero-title">
              Cinematic
              <br />
              automotive
              <br />
              <span className="hero-accent">photography</span>
            </h1>

            <p className="hero-sub">
              Your car, shot the way you see it in your head. On location across Philadelphia and
              the Main Line — golden hour, wet asphalt, city at night, whatever the car asks for.
            </p>

            <div className="hero-ctas">
              <Link to="/book" className="btn btn-primary btn-lg">
                Book a shoot
                <ArrowRight className="arrow" width={17} height={17} aria-hidden="true" />
              </Link>
              <Link to="/portfolio" className="btn btn-secondary btn-lg">
                <Image03 width={17} height={17} aria-hidden="true" />
                See the work
              </Link>
            </div>

            <p className="hero-note">
              Most shoots start with a free consultation. No card needed to book one.
            </p>

            <ul className="hero-stats">
              {STATS.map((s) => (
                <li key={s.label}>
                  <span className="hero-stat-num">{s.num}</span>
                  <span className="hero-stat-label">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-visual">
            <Picture
              src="/brand/hero"
              alt="Automotive photography by Paps Productions"
              label="Hero photograph"
              eager
              className="hero-img"
            />
            <div className="hero-frame" aria-hidden="true" />
          </div>
        </div>
      </section>

      <style>{`
        .hero {
          position: relative;
          padding-block: var(--space-20) var(--space-24);
          overflow: hidden;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: var(--space-16);
          align-items: center;
        }

        .hero-title {
          font-size: clamp(2.75rem, 8vw, 5.5rem);
          line-height: 0.92;
          letter-spacing: 0.005em;
          margin: 0 0 var(--space-6);
        }

        .hero-accent { color: var(--brand-ink); }

        .hero-sub {
          font-size: clamp(1rem, 1.6vw, 1.15rem);
          line-height: 1.7;
          color: var(--text-muted);
          max-width: 46ch;
          margin: 0 0 var(--space-8);
        }

        .hero-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .hero-note {
          margin: 0 0 var(--space-10);
          font-size: 0.84rem;
          color: var(--text-faint);
        }

        .hero-stats {
          display: flex;
          gap: var(--space-10);
          list-style: none;
          margin: 0;
          padding: var(--space-6) 0 0;
          border-top: 1px solid var(--border);
        }

        .hero-stats li { display: flex; flex-direction: column; gap: 2px; }

        .hero-stat-num {
          font-family: var(--font-display);
          font-size: 1.85rem;
          font-weight: 700;
          color: var(--text);
          line-height: 1;
        }

        .hero-stat-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-faint);
        }

        /* --- visual --- */
        .hero-visual { position: relative; }

        .hero-img,
        .hero-img img {
          width: 100%;
          border-radius: var(--radius-lg);
          display: block;
        }

        .hero-img {
          aspect-ratio: 4 / 5;
          overflow: hidden;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.5);
        }

        .hero-img img { height: 100%; object-fit: cover; }

        /* Offset hairline frame — a viewfinder edge rather than a drop shadow */
        .hero-frame {
          position: absolute;
          inset: var(--space-6) calc(var(--space-6) * -1) calc(var(--space-6) * -1) var(--space-6);
          border: 1px solid var(--glass-border-brand);
          border-radius: var(--radius-lg);
          z-index: -1;
          pointer-events: none;
        }

        @media (max-width: 900px) {
          .hero { padding-block: var(--space-12) var(--space-16); }
          .hero-grid { grid-template-columns: 1fr; gap: var(--space-10); }
          .hero-visual { order: -1; }
          .hero-img { aspect-ratio: 3 / 2; }
          .hero-frame { display: none; }
        }

        @media (max-width: 600px) {
          .hero-stats { gap: var(--space-6); }
          .hero-ctas .btn { flex: 1 1 100%; }
        }
      `}</style>
    </>
  );
}
