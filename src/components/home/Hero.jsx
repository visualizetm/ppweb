import { Link } from 'react-router-dom';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';

import Picture from '../Picture';
import LightWedge from '../LightWedge';
import useLightWindow, { formatDuration } from '../../lib/useLightWindow';

/* ===========================================================================
   Hero.
   ---------------------------------------------------------------------------
   The thesis is a live readout, not a composition: today's actual light in
   Philadelphia, and how long until the good part. It is true, it is specific
   to this business, and it changes every minute — which is the opposite of a
   stock hero photo with a headline over a scrim.

   Everything the previous version did has been deleted: the eyebrow pill with
   its pulsing dot, and the row of big-number-over-small-label stats. Both were
   ornament, and both are on the list of things that make a site read as
   generated.
   =========================================================================== */

/** The one line that carries the readout. Wording changes with the situation
    rather than always saying the same thing with different numbers. */
function readout(light) {
  if (!light) return { lead: 'Light', detail: null };

  const { current, remaining, next } = light;

  if ((current === 'golden-morning' || current === 'golden-evening') && remaining != null) {
    return {
      lead: `Golden hour, ${formatDuration(remaining)} left`,
      detail: 'This is the window. If you are shooting today, shoot now.',
    };
  }

  if (current === 'blue' && remaining != null) {
    return {
      lead: `Blue hour, ${formatDuration(remaining)} left`,
      detail: 'Deep sky against warm streetlight. Where the night frames come from.',
    };
  }

  if (next?.label === 'Golden hour starts') {
    return {
      lead: `Golden hour in ${formatDuration(next.minutes)}`,
      detail: 'The hour before sunset does most of the work in these photos.',
    };
  }

  if (next) {
    return {
      lead: `${next.label} in ${formatDuration(next.minutes)}`,
      detail: 'Golden hour is bracketed on the strip above.',
    };
  }

  return { lead: 'After dark', detail: 'Good for garage and city work, where the light is artificial anyway.' };
}

export default function Hero() {
  const light = useLightWindow();
  const { lead, detail } = readout(light);

  return (
    <>
      <section className="hr" aria-labelledby="hr-title">
        <div className="wrap">
          {/* --- the signature ------------------------------------------- */}
          <div className="hr-light plate">
            <div className="hr-light-head">
              <span className="plate-label">Light today</span>
              <span className="plate-label hr-place">{light?.place || 'Philadelphia, PA'}</span>
            </div>

            <LightWedge light={light} />

            <p className="hr-readout">
              <span className="hr-readout-lead">{lead}</span>
              {detail && <span className="hr-readout-detail">{detail}</span>}
            </p>
          </div>

          {/* --- the pitch ------------------------------------------------ */}
          <div className="hr-grid">
            <div className="hr-copy">
              <h1 id="hr-title" className="hr-title">
                The light is
                <br />
                half the job
              </h1>

              <p className="hr-sub">
                I photograph cars around Philadelphia and the Main Line — on streets, in garages,
                on back roads, at meets. Almost everything in the portfolio was shot inside the
                bracketed strip above, and picking the right hour is most of why the photos look
                the way they do.
              </p>

              <div className="hr-ctas">
                <Link to="/book" className="btn btn-primary btn-lg">
                  Book a shoot
                  <ArrowRight className="arrow" width={16} height={16} aria-hidden="true" />
                </Link>
                <Link to="/portfolio" className="btn btn-secondary btn-lg">
                  See the work
                </Link>
              </div>

              <p className="hr-note">
                Booking starts with a conversation, not a card. Nothing is charged when you send it.
              </p>
            </div>

            <div className="hr-visual">
              <Picture
                src="/brand/hero"
                /* Described from the actual image. Probably an Infiniti Q50 —
                   not stated as fact in the alt text because the last site
                   confidently mislabelled all three of its cars. */
                alt="A lowered silver-grey sports sedan on aftermarket wheels, shot from the rear three-quarter outside a modern building under flat winter light"
                label="Hero photograph"
                eager
                className="hr-img"
              />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .hr {
          padding-block: var(--space-8) var(--space-12);
        }

        /* --- light panel --- */
        .hr-light {
          padding: var(--space-5) var(--space-6) var(--space-4);
          margin-bottom: var(--space-12);
        }

        .hr-light-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: var(--space-4);
          margin-bottom: var(--space-5);
        }

        .hr-place { color: var(--ink-soft); }

        .hr-readout {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: var(--space-2) var(--space-4);
          margin: var(--space-4) 0 0;
          padding-top: var(--space-4);
          border-top: 1px solid var(--edge-hair);
        }

        .hr-readout-lead {
          font-family: var(--font-display);
          font-variation-settings: 'wdth' var(--wdth-plate);
          font-weight: 700;
          font-size: clamp(1.1rem, 2.4vw, 1.6rem);
          text-transform: uppercase;
          letter-spacing: -0.005em;
          color: var(--ink);
          line-height: 1;
        }

        .hr-readout-detail {
          color: var(--ink-soft);
          font-size: 0.92rem;
          line-height: 1.5;
        }

        /* --- pitch --- */
        .hr-grid {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: var(--space-12);
          align-items: center;
        }

        .hr-title {
          font-size: clamp(2.5rem, 7vw, 4.75rem);
          line-height: 0.9;
          margin: 0 0 var(--space-6);
        }

        .hr-sub {
          font-size: clamp(0.98rem, 1.5vw, 1.1rem);
          line-height: 1.65;
          color: var(--ink-soft);
          max-width: 48ch;
          margin: 0 0 var(--space-8);
        }

        .hr-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .hr-note {
          margin: 0;
          font-size: 0.85rem;
          color: var(--ink-soft);
        }

        .hr-img,
        .hr-img img {
          width: 100%;
          display: block;
          border-radius: var(--radius-lg);
        }

        .hr-img {
          aspect-ratio: 3 / 2;
          overflow: hidden;
          border: 1px solid var(--edge);
          box-shadow: var(--lift-2);
        }

        .hr-img img { height: 100%; object-fit: cover; }

        @media (max-width: 900px) {
          .hr-grid { grid-template-columns: 1fr; gap: var(--space-8); }
          .hr-light { margin-bottom: var(--space-8); }
        }

        @media (max-width: 600px) {
          .hr-ctas .btn { flex: 1 1 100%; }
          .hr-light { padding-inline: var(--space-4); }
        }
      `}</style>
    </>
  );
}
