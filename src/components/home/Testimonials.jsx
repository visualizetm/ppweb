import Star01 from '@untitled-ui/icons-react/build/esm/Star01';

import { isDemo } from '../../lib/dataSource';

/* ===========================================================================
   Testimonials.
   ---------------------------------------------------------------------------
   Michael has no published reviews. So this component renders LABELLED EMPTY
   SLOTS, not invented quotes — no fabricated names, no fabricated praise, not
   even as demo filler. A made-up review is the one piece of content that can
   damage a real business if it ships, so the placeholder is the deliverable
   until real quotes arrive.

   To go live: fill the `testimonials` array below with real quotes. The moment
   it has entries, the placeholders disappear and the real cards render. No
   other change needed.
   =========================================================================== */

const testimonials = [
  // {
  //   text: 'What they actually said, in their words.',
  //   author: 'First name and last initial',
  //   detail: '2019 Porsche 911 — Solo Shoot',
  // },
];

const SLOT_COUNT = 3;

export default function Testimonials() {
  const hasReal = testimonials.length > 0;

  return (
    <>
      <section className="ts section" aria-labelledby="ts-title">
        <div className="wrap">
          <div className="ts-head reveal">
            <h2 id="ts-title" className="section-title">
              What clients say
            </h2>
            {!hasReal && (
              <p className="section-subtitle">
                This section is ready and waiting on real quotes. Nothing here is invented.
              </p>
            )}
          </div>

          {hasReal ? (
            <div className="ts-grid stagger">
              {testimonials.map((t) => (
                <figure key={t.author} className="ts-card">
                  <span className="ts-stars" aria-hidden="true">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star01 key={i} width={14} height={14} />
                    ))}
                  </span>
                  <blockquote className="ts-quote">{t.text}</blockquote>
                  <figcaption className="ts-by">
                    <span className="ts-mono" aria-hidden="true">
                      {t.author.trim().charAt(0)}
                    </span>
                    <span>
                      <span className="ts-author">{t.author}</span>
                      {t.detail && <span className="ts-detail">{t.detail}</span>}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="ts-grid stagger">
              {Array.from({ length: SLOT_COUNT }, (_, i) => (
                <div key={i} className="ts-slot" data-label="Client quote — awaiting real testimonial">
                  <span className="ts-slot-label">Client quote</span>
                  <span className="ts-slot-note">Awaiting a real testimonial</span>
                </div>
              ))}
            </div>
          )}

          {isDemo && !hasReal && (
            <p className="ts-demo-note">
              Deliberately empty. Testimonials are the one thing not seeded with demo data —
              inventing a review, even as an example, is a risk that is not worth taking.
            </p>
          )}
        </div>
      </section>

      <style>{`
        .ts-head { margin-bottom: var(--space-10); }

        .ts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-5);
        }

        .ts-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin: 0;
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: var(--bg-card);
        }

        .ts-stars { display: inline-flex; gap: 2px; color: var(--brand); }

        .ts-quote {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.7;
          font-size: 0.95rem;
        }

        .ts-by {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-top: auto;
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
        }

        .ts-mono {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          flex: none;
          border-radius: 50%;
          background: var(--glass-bg-brand);
          color: var(--brand-ink);
          font-family: var(--font-display);
          font-weight: 700;
        }

        .ts-author { display: block; color: var(--text); font-weight: 600; font-size: 0.88rem; }
        .ts-detail { display: block; color: var(--text-faint); font-size: 0.76rem; }

        /* --- placeholder slots --- */
        .ts-slot {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          min-height: 190px;
          padding: var(--space-6);
          border: 1.5px dashed var(--border-light);
          border-radius: var(--radius-lg);
          background: var(--surface);
          text-align: center;
        }

        .ts-slot-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-faint);
        }

        .ts-slot-note { font-size: 0.8rem; color: var(--text-faint); }

        .ts-demo-note {
          margin: var(--space-6) 0 0;
          font-size: 0.82rem;
          color: var(--text-faint);
          max-width: 70ch;
        }
      `}</style>
    </>
  );
}
