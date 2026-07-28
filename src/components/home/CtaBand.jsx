import { Link } from 'react-router-dom';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';

export default function CtaBand() {
  return (
    <>
      <section className="cb" aria-labelledby="cb-title">
        <div className="wrap cb-inner reveal">
          <h2 id="cb-title" className="cb-title">
            Let&rsquo;s talk about your car
          </h2>
          <p className="cb-sub">
            Start with a free consultation. No card, no commitment — just a conversation about what
            the shoot should be.
          </p>
          <Link to="/book" className="btn btn-primary btn-lg">
            Book a consultation
            <ArrowRight className="arrow" width={17} height={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <style>{`
        .cb {
          position: relative;
          padding-block: var(--space-24);
          background: var(--bg-deep);
          border-top: 1px solid var(--border);
          overflow: hidden;
        }

        /* Wide, soft brand bloom behind the copy — the only place on the site
           where the accent is allowed to spread out. */
        .cb::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 900px;
          height: 520px;
          transform: translate(-50%, -50%);
          background: radial-gradient(
            ellipse at center,
            rgba(var(--brand-rgb), 0.16) 0%,
            transparent 68%
          );
          pointer-events: none;
        }

        .cb-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--space-5);
        }

        .cb-title {
          margin: 0;
          font-size: clamp(2rem, 5.5vw, 3.5rem);
          line-height: 1;
        }

        .cb-sub {
          margin: 0;
          max-width: 52ch;
          color: var(--text-muted);
          font-size: clamp(0.95rem, 1.6vw, 1.08rem);
          line-height: 1.7;
        }

        @media (max-width: 768px) {
          .cb { padding-block: var(--space-16); }
        }
      `}</style>
    </>
  );
}
