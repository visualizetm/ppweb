import { Link } from 'react-router-dom';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';

import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" />
      <section className="nf texture-trails">
        <div className="wrap nf-inner">
          <span className="nf-code display">404</span>
          <h1 className="nf-title display">Nothing here</h1>
          <p className="nf-sub">
            That page does not exist, or it moved when the site was rebuilt. The galleries are all
            still here.
          </p>
          <div className="nf-ctas">
            <Link to="/portfolio" className="btn btn-primary">
              View the portfolio
              <ArrowRight className="arrow" width={16} height={16} aria-hidden="true" />
            </Link>
            <Link to="/" className="btn btn-secondary">
              Back home
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .nf { padding-block: var(--space-24); }

        .nf-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--space-4);
        }

        .nf-code {
          font-size: clamp(4rem, 16vw, 9rem);
          line-height: 1;
          color: var(--brand-ink);
          opacity: 0.28;
        }

        .nf-title { font-size: clamp(1.75rem, 5vw, 2.75rem); margin: 0; }

        .nf-sub { margin: 0; max-width: 46ch; color: var(--text-muted); }

        .nf-ctas { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-4); }
      `}</style>
    </>
  );
}
