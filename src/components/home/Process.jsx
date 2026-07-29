import MessageSquare01 from '@untitled-ui/icons-react/build/esm/MessageSquare01';
import Calendar from '@untitled-ui/icons-react/build/esm/Calendar';
import Camera01 from '@untitled-ui/icons-react/build/esm/Camera01';
import Image03 from '@untitled-ui/icons-react/build/esm/Image03';

/* His actual process, taken from what the old site said: "All bookings start
   with a meeting to discuss your project." Not a generic four-step template. */
const STEPS = [
  {
    num: '01',
    title: 'We talk first',
    desc: 'Free consultation, no card. How many cars, how many people, where, and what you actually want out of it. Most bookings start here.',
    icon: MessageSquare01,
  },
  {
    num: '02',
    title: 'Pick the light',
    desc: 'We settle the date and time. Golden hour and the window either side of it are marked as recommended, because that is where most of the portfolio comes from.',
    icon: Calendar,
  },
  {
    num: '03',
    title: 'The shoot',
    desc: 'On location, not in a studio. The booking lists a time — if we are close to something good when it runs out, I keep going.',
    icon: Camera01,
  },
  {
    num: '04',
    title: 'The edit',
    desc: 'Everything delivered is fully edited. That is a large part of why the photos look the way they do, and it is not an upsell.',
    icon: Image03,
  },
];

export default function Process() {
  return (
    <>
      <section className="pr section section-dark" aria-labelledby="pr-title">
        <div className="wrap">
          <div className="pr-head" data-reveal>
            <h2 id="pr-title" className="section-title">
              How it works
            </h2>
            <p className="section-subtitle">
              Four steps, and the first one is a conversation rather than a payment.
            </p>
          </div>

          <ol className="pr-grid" data-reveal="stagger">
            {STEPS.map(({ num, title, desc, icon: Icon }) => (
              <li key={num} className="pr-card">
                <span className="pr-num">{num}</span>
                <span className="pr-icon" aria-hidden="true">
                  <Icon width={19} height={19} />
                </span>
                <h3 className="pr-title">{title}</h3>
                <p className="pr-desc">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <style>{`
        .pr-head { margin-bottom: var(--space-12); }

        .pr-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-5);
          list-style: none;
          margin: 0;
          padding: 0;
        }

        /* Connector line, wide screens only. Sits behind the cards. */
        .pr-grid::before {
          content: '';
          position: absolute;
          top: 46px;
          left: 12%;
          right: 12%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--border-light) 15%,
            var(--border-light) 85%,
            transparent
          );
          z-index: 0;
        }

        .pr-card {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: var(--bg-card);
          transition: transform var(--duration-fast) var(--ease),
            border-color var(--duration-fast) var(--ease);
        }

        .pr-card:hover {
          transform: translateY(-3px);
          border-color: var(--glass-border-brand);
        }

        .pr-num {
          font-family: var(--font-display);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: var(--brand-ink);
        }

        .pr-icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius);
          background: var(--glass-bg-brand);
          border: 1px solid var(--glass-border-brand);
          color: var(--brand-ink);
        }

        .pr-title { margin: 0; font-size: 1.1rem; letter-spacing: 0.02em; }

        .pr-desc {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.88rem;
          line-height: 1.65;
        }

        @media (max-width: 1000px) {
          .pr-grid { grid-template-columns: repeat(2, 1fr); }
          .pr-grid::before { display: none; }
        }

        @media (max-width: 600px) {
          .pr-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
