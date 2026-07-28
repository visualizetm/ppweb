import { Link } from 'react-router-dom';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';
import MarkerPin01 from '@untitled-ui/icons-react/build/esm/MarkerPin01';

import Seo from '../components/Seo';
import Picture from '../components/Picture';
import { site } from '../data/site';

/* The two Behind the Lens images and their captions are carried over from the
   previous site, where they were the only glimpse of him working. */
const BTS = [
  { src: '/brand/bts-on-location', caption: 'On Location', alt: 'Photographer in action' },
  { src: '/brand/bts-gear', caption: 'Gear & Setup', alt: 'Camera gear closeup' },
];

const BELIEFS = [
  {
    title: 'The location is part of the photo',
    body: 'There is no studio, and that is deliberate. A car in a white void is a product shot. A car on a wet road under a streetlight is a photograph.',
  },
  {
    title: 'Everything delivered is edited',
    body: 'Not a selection of edited frames with the rest thrown in raw. If it reaches you, it has been worked on. That is a large part of why the photos look the way they do.',
  },
  {
    title: 'No promised photo count',
    body: 'I will not cap a shoot at a number. I turn up looking for every shot the day will give, and you get all the ones worth having.',
  },
  {
    title: 'Time is a plan, not a limit',
    body: 'Your booking lists a duration. If we are close to something good when it runs out, I keep shooting.',
  },
];

export default function About() {
  return (
    <>
      <Seo
        title="Behind the Lens"
        description={`About ${site.photographer} of ${site.name} — cinematic automotive photography across Philadelphia and the Main Line.`}
      />

      <section className="ab-hero texture-trails">
        <div className="wrap ab-hero-grid">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              Behind the lens
            </span>
            <h1 className="ab-title display">{site.photographer}</h1>
            <p className="ab-lead">
              I shoot cars the way I want to see them photographed — on real roads, in real light,
              with the time it takes to get it right.
            </p>
            <p className="ab-body">
              Paps Productions is me. Every shoot, every edit, every conversation. That is the reason
              bookings start with a meeting rather than a form: I would rather know what you actually
              want before I quote you for it.
            </p>
            <p className="ab-body">
              Automotive is the bulk of the work, and it is where most people find me. But I also
              shoot portraits, weddings and events, and I edit photos other people took. If you have
              something in mind that is not on the services page, ask.
            </p>

            <p className="ab-area">
              <MarkerPin01 width={15} height={15} aria-hidden="true" />
              {site.serviceArea.base}
            </p>
          </div>

          <div className="ab-portrait">
            {/* PLACEHOLDER: no portrait of Michael exists on the old site. */}
            <div className="slot ab-portrait-slot" data-label="Portrait of Michael" />
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="wrap">
          <h2 className="section-title reveal">On location</h2>
          <p className="section-subtitle reveal">{site.serviceArea.blurb}</p>

          <div className="ab-bts stagger">
            {BTS.map((b) => (
              <figure key={b.src} className="ab-bts-item">
                <Picture src={b.src} alt={b.alt} label={b.caption} className="ab-bts-img" />
                <figcaption>{b.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap ab-beliefs-wrap">
          <h2 className="section-title reveal">How I work</h2>
          <ul className="ab-beliefs stagger">
            {BELIEFS.map((b) => (
              <li key={b.title} className="ab-belief">
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </li>
            ))}
          </ul>

          <div className="ab-cta reveal">
            <Link to="/book" className="btn btn-primary btn-lg">
              Book a consultation
              <ArrowRight className="arrow" width={17} height={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .ab-hero { padding-block: var(--space-16) var(--space-20); }

        .ab-hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: var(--space-16);
          align-items: start;
        }

        .ab-title { font-size: clamp(2.5rem, 7vw, 4.25rem); margin: 0 0 var(--space-5); }

        .ab-lead {
          font-size: clamp(1.1rem, 2.2vw, 1.4rem);
          line-height: 1.55;
          color: var(--text);
          margin: 0 0 var(--space-6);
          padding-left: var(--space-5);
          border-left: 2px solid var(--brand);
        }

        .ab-body { margin: 0 0 var(--space-4); color: var(--text-muted); line-height: 1.8; }

        .ab-area {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: var(--space-4);
          color: var(--text-faint);
          font-size: 0.84rem;
        }

        .ab-portrait-slot {
          aspect-ratio: 4 / 5;
          border-radius: var(--radius-lg);
          min-height: 0;
        }

        .ab-bts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-5);
          margin-top: var(--space-10);
        }

        .ab-bts-item { margin: 0; }

        .ab-bts-img,
        .ab-bts-img img {
          width: 100%;
          border-radius: var(--radius-lg);
          display: block;
        }

        .ab-bts-img {
          aspect-ratio: 4 / 3;
          overflow: hidden;
          margin-bottom: var(--space-3);
        }

        .ab-bts-img img { height: 100%; object-fit: cover; }

        .ab-bts-item figcaption {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-faint);
        }

        .ab-beliefs-wrap { max-width: 900px; }

        .ab-beliefs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-5);
          list-style: none;
          margin: var(--space-10) 0 0;
          padding: 0;
        }

        .ab-belief {
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: var(--bg-card);
        }

        .ab-belief h3 { margin: 0 0 var(--space-3); font-size: 1.1rem; letter-spacing: 0.02em; }
        .ab-belief p { margin: 0; color: var(--text-muted); font-size: 0.9rem; line-height: 1.7; }

        .ab-cta { margin-top: var(--space-12); }

        @media (max-width: 900px) {
          .ab-hero-grid { grid-template-columns: 1fr; gap: var(--space-8); }
          .ab-portrait { max-width: 340px; }
        }
      `}</style>
    </>
  );
}
