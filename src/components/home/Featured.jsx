import { Link } from 'react-router-dom';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';

import GalleryCard, { galleryCardStyles } from '../GalleryCard';
import { featuredGalleries } from '../../data/galleries';

export default function Featured() {
  return (
    <>
      <section className="fw section section-dark" aria-labelledby="fw-title">
        <div className="wrap">
          <div className="fw-head reveal">
            <div>
              <h2 id="fw-title" className="section-title">
                Recent work
              </h2>
              <p className="section-subtitle">
                Three from the last few months. Every shoot gets its own gallery.
              </p>
            </div>
            <Link to="/portfolio" className="btn btn-secondary btn-sm fw-all">
              All galleries
              <ArrowRight className="arrow" width={15} height={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="fw-grid stagger">
            {featuredGalleries.map((g) => (
              <GalleryCard key={g.slug} gallery={g} featured />
            ))}
          </div>
        </div>
      </section>

      <style>{`
        ${galleryCardStyles}

        .fw-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: var(--space-6);
          margin-bottom: var(--space-10);
        }

        .fw-all { flex: none; }

        .fw-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-6);
        }

        @media (max-width: 768px) {
          .fw-head { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </>
  );
}
