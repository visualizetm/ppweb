import { Link } from 'react-router-dom';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';

import GalleryCard, { galleryCardStyles } from '../GalleryCard';
import { useContent, useFeaturedGalleries } from '../../lib/useContent';

export default function Featured() {
  const c = useContent('home');
  const featuredGalleries = useFeaturedGalleries(3);

  return (
    <>
      <section className="fw section section-dark" aria-labelledby="fw-title">
        <div className="wrap">
          <div className="fw-head" data-reveal>
            <div>
              <h2 id="fw-title" className="section-title">
                {c.featuredTitle}
              </h2>
              <p className="section-subtitle">{c.featuredSubtitle}</p>
            </div>
            <Link to="/portfolio" className="btn btn-secondary btn-sm fw-all">
              All galleries
              <ArrowRight className="arrow" width={15} height={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="fw-grid" data-reveal="stagger">
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
          grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
          gap: var(--space-6);
        }

        @media (max-width: 768px) {
          .fw-head { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </>
  );
}
