import { Link } from 'react-router-dom';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';
import MarkerPin01 from '@untitled-ui/icons-react/build/esm/MarkerPin01';

import Wordmark from './Wordmark';
import { SOCIAL_ICONS } from './SocialIcon';
import { site } from '../data/site';
import { isDemo } from '../lib/dataSource';

const COLUMNS = [
  {
    title: 'The work',
    links: [
      { to: '/portfolio', label: 'Portfolio' },
      { to: '/services', label: 'Services & Pricing' },
      { to: '/about', label: 'Behind the Lens' },
    ],
  },
  {
    title: 'Booking',
    links: [
      { to: '/book', label: 'Book a shoot' },
      { to: '/faq', label: 'FAQ' },
      { to: '/contact', label: 'Contact' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <footer className="ft">
        <div className="wrap ft-inner">
          <div className="ft-brand">
            <Wordmark size="lg" variant="full" />
            <p className="ft-tagline">{site.tagline}</p>

            <p className="ft-area">
              <MarkerPin01 width={15} height={15} aria-hidden="true" />
              {site.serviceArea.base}
            </p>

            <div className="ft-social">
              {site.social.map((s) => {
                const Icon = SOCIAL_ICONS[s.id];
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ft-social-btn"
                    aria-label={`${site.name} on ${s.label}`}
                  >
                    {Icon ? <Icon width={18} height={18} /> : s.label}
                  </a>
                );
              })}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} className="ft-col" aria-label={col.title}>
              <h2 className="ft-col-title">{col.title}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="ft-link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="ft-cta">
            <h2 className="ft-col-title">Start with a conversation</h2>
            <p className="ft-cta-text">
              Most shoots begin with a free consultation. No card, no commitment — we work out what
              the shoot actually needs first.
            </p>
            <Link to="/booking" className="btn btn-primary btn-sm">
              Book a consultation
              <ArrowRight className="arrow" width={15} height={15} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="wrap ft-bottom">
          <p className="ft-copy">
            &copy; {year} {site.name}. Photography by {site.photographer}.
          </p>
          <p className="ft-stamp" title="Deployed build">
            {isDemo ? 'demo · ' : ''}
            {__BUILD_SHA__}
          </p>
        </div>
      </footer>

      <style>{`
        .ft {
          background: var(--bg-deep);
          border-top: 1px solid var(--border);
          padding-top: var(--space-20);
          margin-top: var(--space-8);
        }

        .ft-inner {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1.4fr;
          gap: var(--space-12);
          padding-bottom: var(--space-16);
        }

        .ft-tagline {
          margin: var(--space-4) 0 var(--space-3);
          color: var(--text-muted);
          font-size: 0.9rem;
          max-width: 34ch;
        }

        .ft-area {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin: 0 0 var(--space-5);
          color: var(--text-faint);
          font-size: 0.82rem;
        }

        .ft-social { display: flex; gap: var(--space-2); }

        .ft-social-btn {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid var(--border-light);
          background: var(--glass-bg);
          color: var(--text-secondary);
          transition: color var(--duration-fast) var(--ease),
            border-color var(--duration-fast) var(--ease),
            background-color var(--duration-fast) var(--ease),
            transform var(--duration-fast) var(--ease);
        }

        .ft-social-btn:hover {
          color: var(--brand-ink);
          border-color: var(--glass-border-brand);
          background: var(--glass-bg-brand);
          transform: translateY(-2px);
        }

        .ft-col-title {
          font-family: var(--font-body);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-faint);
          margin: 0 0 var(--space-4);
        }

        .ft-col ul { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-3); }

        .ft-link {
          color: var(--text-secondary);
          font-size: 0.9rem;
          transition: color var(--duration-fast) var(--ease);
        }

        .ft-link:hover { color: var(--brand-ink); }

        .ft-cta-text {
          margin: 0 0 var(--space-5);
          color: var(--text-muted);
          font-size: 0.88rem;
          line-height: 1.65;
        }

        .ft-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          padding-block: var(--space-5);
          border-top: 1px solid var(--border);
        }

        .ft-copy, .ft-stamp {
          margin: 0;
          font-size: 0.78rem;
          color: var(--text-faint);
        }

        .ft-stamp {
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.06em;
        }

        @media (max-width: 900px) {
          .ft-inner { grid-template-columns: 1fr 1fr; gap: var(--space-10); }
          .ft-brand, .ft-cta { grid-column: 1 / -1; }
        }

        @media (max-width: 600px) {
          .ft-inner { grid-template-columns: 1fr; }
          .ft-bottom { flex-direction: column; align-items: flex-start; gap: var(--space-2); }
        }
      `}</style>
    </>
  );
}
