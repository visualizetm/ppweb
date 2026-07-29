import { Link } from 'react-router-dom';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';

import { homepageFaq } from '../../data/faqs';

/* ===========================================================================
   "How many photos do I get?"
   ---------------------------------------------------------------------------
   Promoted out of the FAQ into its own section because it is the question
   every customer asks before booking, and because his answer is a genuine
   differentiator rather than a dodge. Buried in an accordion it converts
   nobody; given room, it does the selling.
   =========================================================================== */

export default function HowManyPhotos() {
  if (!homepageFaq) return null;

  const [lead, ...rest] = homepageFaq.answer;

  return (
    <>
      <section className="hmp section" aria-labelledby="hmp-title">
        <div className="wrap hmp-grid">
          <div className="hmp-q" data-reveal="slide-left">
            <span className="hmp-label">The question everyone asks</span>
            <h2 id="hmp-title" className="hmp-title">
              {homepageFaq.question}
            </h2>
          </div>

          <div className="hmp-a" data-reveal="slide-right">
            <p className="hmp-lead">{lead}</p>
            {rest.map((para) => (
              <p key={para.slice(0, 32)} className="hmp-para">
                {para}
              </p>
            ))}
            <Link to="/faq" className="arrow-link hmp-link">
              More questions answered
              <ArrowRight className="arrow" width={15} height={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .hmp {
          border-block: 1px solid var(--border);
          background: var(--bg-elevated);
        }

        .hmp-grid {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: var(--space-16);
          align-items: start;
        }

        .hmp-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--brand-ink);
          margin-bottom: var(--space-4);
        }

        .hmp-title {
          font-size: clamp(1.85rem, 4.2vw, 3rem);
          line-height: 1;
          margin: 0;
          color: var(--text);
        }

        /* The first paragraph is the answer; the rest is the reasoning. */
        .hmp-lead {
          font-size: clamp(1.15rem, 2.2vw, 1.5rem);
          line-height: 1.5;
          color: var(--text);
          font-weight: 500;
          margin: 0 0 var(--space-6);
          padding-left: var(--space-5);
          border-left: 2px solid var(--brand);
        }

        .hmp-para {
          margin: 0 0 var(--space-4);
          color: var(--text-muted);
          line-height: 1.75;
        }

        .hmp-link { margin-top: var(--space-2); }

        @media (max-width: 900px) {
          .hmp-grid { grid-template-columns: 1fr; gap: var(--space-8); }
        }
      `}</style>
    </>
  );
}
