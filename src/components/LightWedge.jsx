import { useEffect, useRef } from 'react';

/* ===========================================================================
   The light wedge — this site's signature element.
   ---------------------------------------------------------------------------
   WHAT IT IS

   A live readout of today's light in Delaware County: night, blue hour, golden
   hour, daylight, laid out left to right, with a needle on the current moment.
   It is real information, computed from the solar position (src/lib/sun.js),
   and it changes every minute of every day.

   WHY THIS SHAPE

   It is drawn as a STEP WEDGE — the calibrated strip of grey patches a
   photographer uses to check tonal response. That is not decoration: the thing
   being displayed genuinely is a ramp of light levels, so a densitometer strip
   is the honest way to draw it. It also rhymes with the site's ground, which
   is the 18% grey card from the same corner of the same craft.

   The wedge is ACHROMATIC. Every band is a luminance step, because light
   levels are what it encodes. The single chromatic mark on the whole thing is
   the needle showing NOW, in primer. One colour, spent on the one fact that
   matters most.

   THE SWEEP

   On load the needle runs the full track once and settles on the current time
   — the self-test a car's instrument cluster performs at ignition. It happens
   once, it lasts 1.6 seconds, and it is the only orchestrated motion on the
   site. Under prefers-reduced-motion the needle simply appears in place.
   =========================================================================== */

const TONE_LABEL = {
  0: 'Dark',
  1: 'Blue hour',
  3: 'Golden hour',
  4: 'Daylight',
};

export default function LightWedge({ light, compact = false }) {
  const needleRef = useRef(null);
  const hasSwept = useRef(false);

  useEffect(() => {
    const el = needleRef.current;
    if (!el || !light || hasSwept.current) return;
    hasSwept.current = true;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || compact) return; // resting position is already correct

    /* Driven from JS rather than CSS keyframes so the final frame can be the
       real computed position rather than a guess, and so the whole thing is a
       single declarative animation with a proper fill. */
    el.animate(
      [
        { left: '0%', opacity: 0 },
        { left: '0%', opacity: 1, offset: 0.08 },
        { left: '100%', offset: 0.62 },
        { left: `${light.nowLeft}%` },
      ],
      {
        duration: 1600,
        easing: 'cubic-bezier(0.34, 0.02, 0.16, 1)',
        fill: 'forwards',
      }
    );
  }, [light, compact]);

  if (!light) return null;

  const { segments, ticks, nowLeft, timeZone } = light;
  const time = (d) =>
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone,
    }).format(d);

  return (
    <>
      <figure className={`lw ${compact ? 'lw-compact' : ''}`}>
        <div className="lw-track" role="img" aria-label={wedgeDescription(light, time)}>
          {segments.map((s, i) => (
            <span
              key={`${s.key}-${i}`}
              className={`lw-band lw-tone-${s.tone}`}
              style={{ left: `${s.left}%`, width: `${s.width}%` }}
              title={TONE_LABEL[s.tone]}
            />
          ))}

          {/* Golden bands get a bracket beneath rather than a colour, so the
              wedge stays achromatic and the emphasis still reads. */}
          {segments
            .filter((s) => s.tone === 3)
            .map((s, i) => (
              <span
                key={`gold-${i}`}
                className="lw-bracket"
                style={{ left: `${s.left}%`, width: `${s.width}%` }}
                aria-hidden="true"
              >
                <span className="lw-bracket-label">Golden</span>
              </span>
            ))}

          <span
            ref={needleRef}
            className="lw-needle"
            style={{ left: `${nowLeft}%` }}
            aria-hidden="true"
          />
        </div>

        {!compact && (
          <figcaption className="lw-ticks">
            {ticks.map((t) => (
              <span key={t.label} className="lw-tick" style={{ left: `${t.left}%` }}>
                <span className="lw-tick-mark" aria-hidden="true" />
                <span className="lw-tick-time data">{time(t.date)}</span>
                <span className="lw-tick-label">{t.label}</span>
              </span>
            ))}
          </figcaption>
        )}
      </figure>

      <style>{`
        .lw {
          margin: 0;
          width: 100%;
        }

        .lw-track {
          position: relative;
          height: 26px;
          border: 1px solid var(--edge-strong);
          border-radius: var(--radius-sm);
          overflow: visible;
          background: var(--ground-deep);
        }

        .lw-compact .lw-track { height: 10px; }

        .lw-band {
          position: absolute;
          top: 0;
          bottom: 0;
          display: block;
        }

        /* Luminance steps, not hues. This is the densitometer strip. */
        .lw-tone-0 { background: #14161a; }
        .lw-tone-1 { background: #4a4f57; }
        .lw-tone-3 { background: #9296a0; }
        .lw-tone-4 { background: #d2d5db; }

        :root[data-theme='dark'] .lw-tone-0 { background: #0c0d10; }
        :root[data-theme='dark'] .lw-tone-1 { background: #3c4149; }
        :root[data-theme='dark'] .lw-tone-3 { background: #767c86; }
        :root[data-theme='dark'] .lw-tone-4 { background: #b3b9c1; }

        /* Golden hour: bracketed, not coloured. */
        .lw-bracket {
          position: absolute;
          bottom: -6px;
          height: 5px;
          border: 1px solid var(--ink);
          border-top: none;
          display: block;
          pointer-events: none;
        }

        /* The golden band names itself under its own bracket. This is why the
           track carries no "Golden" tick — at this scale golden-hour start and
           sunset sit a few percent apart and their labels overlapped. */
        .lw-bracket-label {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 3px;
          font-family: var(--font-mono);
          font-size: 0.56rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink);
          white-space: nowrap;
        }

        .lw-compact .lw-bracket { display: none; }

        /* The one chromatic mark on the entire component. */
        .lw-needle {
          position: absolute;
          top: -6px;
          bottom: -6px;
          width: 3px;
          margin-left: -1.5px;
          background: var(--primer);
          box-shadow: 0 0 0 1px var(--panel-high);
          border-radius: 1px;
          display: block;
        }

        .lw-needle::before {
          content: '';
          position: absolute;
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid var(--primer);
        }

        .lw-compact .lw-needle { top: -3px; bottom: -3px; }
        .lw-compact .lw-needle::before { display: none; }

        .lw-ticks {
          position: relative;
          height: 40px;
          margin: var(--space-6) 0 0;
        }

        .lw-tick {
          position: absolute;
          top: 0;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          white-space: nowrap;
        }

        .lw-tick-mark {
          width: 1px;
          height: 5px;
          background: var(--ink-faint);
        }

        .lw-tick-time {
          font-size: 0.72rem;
          font-weight: 500;
          color: var(--ink);
        }

        .lw-tick-label {
          font-family: var(--font-mono);
          font-size: 0.58rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-soft);
        }

        /* First and last ticks pull inward so they do not clip the container. */
        .lw-tick:first-child { transform: translateX(-25%); }
        .lw-tick:last-child { transform: translateX(-75%); }

        @media (max-width: 600px) {
          .lw-tick-label { display: none; }
          .lw-ticks { height: 26px; }
        }
      `}</style>
    </>
  );
}

/* The wedge is a graphic, so it needs a text equivalent that says the same
   thing — not "decorative chart", the actual numbers. */
function wedgeDescription(light, time) {
  const { times, current, timeZone } = light;
  void timeZone;
  const parts = [
    `Today's light: sunrise ${time(times.sunrise)}`,
    times.goldenEveningStart ? `evening golden hour from ${time(times.goldenEveningStart)}` : null,
    `sunset ${time(times.sunset)}`,
    `currently ${current.replace('-', ' ')}`,
  ].filter(Boolean);
  return parts.join(', ');
}
