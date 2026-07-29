import { Link, useParams } from 'react-router-dom';
import ArrowLeft from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';
import MarkerPin01 from '@untitled-ui/icons-react/build/esm/MarkerPin01';
import Calendar from '@untitled-ui/icons-react/build/esm/Calendar';

import Seo from '../components/Seo';
import Picture from '../components/Picture';
import { getGallery, galleries } from '../data/galleries';
import { getPackage } from '../data/packages';
import NotFound from './NotFound';

/* How many placeholder slots to draw for a gallery whose images have not been
   migrated yet. Enough to show what the layout will look like, not so many that
   the page reads as broken. */
const PLACEHOLDER_SLOTS = 6;

export default function Gallery() {
  const { slug } = useParams();
  const gallery = getGallery(slug);

  if (!gallery) return <NotFound />;

  const { title, caption, blurb, dateLabel, type, location, cover, coverAlt, images, packageSlug } =
    gallery;

  const pkg = getPackage(packageSlug);
  const index = galleries.findIndex((g) => g.slug === slug);
  const next = galleries[(index + 1) % galleries.length];
  const hasImages = images && images.length > 0;

  return (
    <>
      <Seo title={`${title} — ${dateLabel || type}`} description={blurb} />

      <article className="gl">
        <div className="wrap gl-top">
          <Link to="/portfolio" className="gl-back">
            <ArrowLeft width={15} height={15} aria-hidden="true" />
            All galleries
          </Link>

          <span className="gl-type">{type}</span>
          <h1 className="gl-title display">{title}</h1>
          <p className="gl-caption">{caption}</p>

          <ul className="gl-meta">
            {dateLabel && (
              <li>
                <Calendar width={14} height={14} aria-hidden="true" />
                {dateLabel}
              </li>
            )}
            {location && (
              <li>
                <MarkerPin01 width={14} height={14} aria-hidden="true" />
                {location}
              </li>
            )}
          </ul>

          {blurb && <p className="gl-blurb">{blurb}</p>}
        </div>

        {cover && (
          <div className="wrap wrap-wide">
            <Picture
              src={cover}
              alt={coverAlt || `${title} — ${caption}`}
              label={`${title} cover`}
              eager
              className="gl-cover"
            />
          </div>
        )}

        <div className="wrap wrap-wide gl-images">
          {hasImages ? (
            images.map((img, i) => (
              <Picture
                key={img.src}
                src={img.src}
                alt={img.alt || ''}
                label="Gallery photo"
                eager={i < 2}
                className="gl-photo"
              />
            ))
          ) : (
            <>
              {Array.from({ length: PLACEHOLDER_SLOTS }, (_, i) => (
                <div key={i} className="slot gl-photo" data-label={`Photo ${i + 1}`} />
              ))}
            </>
          )}
        </div>

        {!hasImages && (
          <div className="wrap">
            <p className="gl-pending">
              The full set for this shoot has not been migrated yet. The layout above is live —
              images drop straight into it once they land.
            </p>
          </div>
        )}

        <div className="wrap gl-foot">
          {pkg && (
            <Link to={`/booking?package=${pkg.slug}`} className="btn btn-primary">
              Book a {pkg.shortName.toLowerCase()} shoot
              <ArrowRight className="arrow" width={16} height={16} aria-hidden="true" />
            </Link>
          )}
          {next && next.slug !== slug && (
            <Link to={`/portfolio/${next.slug}`} className="gl-next">
              Next gallery
              <span className="gl-next-name">
                {next.title}
                {next.dateLabel ? ` · ${next.dateLabel}` : ''}
              </span>
              <ArrowRight className="arrow" width={16} height={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      </article>

      <style>{`
        .gl { padding-block: var(--space-10) var(--space-20); }

        .gl-top { max-width: 760px; }

        .gl-back {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-8);
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .gl-back:hover { color: var(--brand-ink); }

        .gl-type {
          display: inline-block;
          padding: 3px var(--space-3);
          border-radius: var(--radius-pill);
          border: 1px solid var(--glass-border-brand);
          background: var(--glass-bg-brand);
          color: var(--brand-ink);
          font-size: 0.64rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: var(--space-4);
        }

        .gl-title {
          font-size: clamp(2.25rem, 7vw, 4rem);
          margin: 0 0 var(--space-3);
        }

        .gl-caption {
          margin: 0 0 var(--space-5);
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: var(--text-secondary);
        }

        .gl-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-5);
          list-style: none;
          margin: 0 0 var(--space-6);
          padding: 0;
        }

        .gl-meta li {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.82rem;
          color: var(--text-faint);
        }

        .gl-blurb {
          margin: 0 0 var(--space-12);
          color: var(--text-muted);
          line-height: 1.75;
        }

        .gl-cover,
        .gl-cover img {
          width: 100%;
          border-radius: var(--radius-lg);
          display: block;
        }

        .gl-cover {
          aspect-ratio: 16 / 9;
          overflow: hidden;
          margin-bottom: var(--space-6);
        }

        .gl-cover img { height: 100%; object-fit: cover; }

        .gl-images {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }

        .gl-photo,
        .gl-photo img {
          width: 100%;
          border-radius: var(--radius);
          display: block;
        }

        .gl-photo {
          aspect-ratio: 3 / 2;
          overflow: hidden;
          min-height: 0;
        }

        .gl-photo img { height: 100%; object-fit: cover; }

        .gl-pending {
          margin: 0 0 var(--space-10);
          padding: var(--space-4) var(--space-5);
          border-radius: var(--radius);
          border: 1px solid var(--border-light);
          background: var(--surface);
          color: var(--text-muted);
          font-size: 0.86rem;
          max-width: 70ch;
        }

        .gl-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-5);
          padding-top: var(--space-10);
          border-top: 1px solid var(--border);
        }

        .gl-next {
          display: inline-flex;
          align-items: center;
          gap: var(--space-3);
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .gl-next:hover { color: var(--brand-ink); }

        .gl-next-name { color: var(--text); font-weight: 600; }
      `}</style>
    </>
  );
}
