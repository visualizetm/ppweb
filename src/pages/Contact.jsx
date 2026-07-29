import { Link } from 'react-router-dom';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Mail01 from '@untitled-ui/icons-react/build/esm/Mail01';
import Phone01 from '@untitled-ui/icons-react/build/esm/Phone01';
import MarkerPin01 from '@untitled-ui/icons-react/build/esm/MarkerPin01';
import Clock from '@untitled-ui/icons-react/build/esm/Clock';

import Seo from '../components/Seo';
import { SOCIAL_ICONS } from '../components/SocialIcon';
import { site } from '../data/site';

/* ===========================================================================
   Contact.
   ---------------------------------------------------------------------------
   Michael's email and phone are not published anywhere on the current site, so
   I do not have them. Rather than print an invented address that would bounce,
   each unconfirmed channel renders a labelled slot.

   Flip `contact.published` to true in src/data/site.js once the real details
   are in, and the real cards replace the slots automatically. Same for
   `hours.published`.
   =========================================================================== */

export default function Contact() {
  const { contact, social, serviceArea, hours } = site;

  return (
    <>
      <Seo
        title="Contact"
        description="Get in touch with Paps Productions — cinematic automotive photography in Delaware County, near Philadelphia."
      />

      <section className="ct-hero texture-trails">
        <div className="wrap">
          <span className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Get in touch
          </span>
          <h1 className="ct-title display">Contact</h1>
          <p className="section-subtitle">
            The fastest route is the booking page — a consultation is free and it puts a real
            conversation in the diary rather than starting an email thread.
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="wrap ct-grid">
          <div className="ct-primary">
            <h2 className="ct-h2">Book a consultation</h2>
            <p className="ct-p">
              No card, no commitment. Pick a time, tell me roughly what you have in mind, and we
              work out the rest on the call.
            </p>
            <Link to="/booking" className="btn btn-primary btn-lg">
              Start a booking
              <ArrowRight className="arrow" width={17} height={17} aria-hidden="true" />
            </Link>

            <h2 className="ct-h2 ct-h2-spaced">Or find me here</h2>
            <div className="ct-social">
              {social.map((s) => {
                const Icon = SOCIAL_ICONS[s.id];
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ct-social-row"
                  >
                    <span className="ct-social-icon" aria-hidden="true">
                      {Icon && <Icon width={18} height={18} />}
                    </span>
                    <span>
                      <span className="ct-social-label">{s.label}</span>
                      <span className="ct-social-handle">{s.handle}</span>
                    </span>
                    <ArrowRight className="arrow" width={15} height={15} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          <aside className="ct-details">
            <h2 className="ct-h2">Details</h2>

            <ul className="ct-list">
              <li className="ct-item">
                <span className="ct-item-icon" aria-hidden="true">
                  <MarkerPin01 width={17} height={17} />
                </span>
                <span>
                  <span className="ct-item-label">Where I shoot</span>
                  <span className="ct-item-value">{serviceArea.base}</span>
                  <span className="ct-item-note">
                    Travel included within {serviceArea.freeRadiusMiles} miles
                  </span>
                </span>
              </li>

              {contact.published ? (
                <>
                  <li className="ct-item">
                    <span className="ct-item-icon" aria-hidden="true">
                      <Mail01 width={17} height={17} />
                    </span>
                    <span>
                      <span className="ct-item-label">Email</span>
                      <a className="ct-item-value ct-link" href={`mailto:${contact.email}`}>
                        {contact.email}
                      </a>
                      <span className="ct-item-note">Replies {contact.responseTime}</span>
                    </span>
                  </li>
                  <li className="ct-item">
                    <span className="ct-item-icon" aria-hidden="true">
                      <Phone01 width={17} height={17} />
                    </span>
                    <span>
                      <span className="ct-item-label">Phone</span>
                      <a className="ct-item-value ct-link" href={contact.phoneHref}>
                        {contact.phone}
                      </a>
                    </span>
                  </li>
                </>
              ) : (
                <li className="ct-slot" data-label="Email and phone">
                  <span className="ct-slot-label">Email &amp; phone</span>
                  <span className="ct-slot-note">
                    Not published on the current site, so I do not have them yet. Add them to{' '}
                    <code>src/data/site.js</code> and set <code>published: true</code> — they appear
                    here and in the footer automatically.
                  </span>
                </li>
              )}

              {hours.published ? (
                <li className="ct-item">
                  <span className="ct-item-icon" aria-hidden="true">
                    <Clock width={17} height={17} />
                  </span>
                  <span>
                    <span className="ct-item-label">Hours</span>
                    {hours.lines.map((h) => (
                      <span key={h.days} className="ct-item-value ct-item-hours">
                        <span>{h.days}</span>
                        <span>{h.time}</span>
                      </span>
                    ))}
                  </span>
                </li>
              ) : (
                <li className="ct-item ct-item-muted">
                  <span className="ct-item-icon" aria-hidden="true">
                    <Clock width={17} height={17} />
                  </span>
                  <span>
                    <span className="ct-item-label">When I shoot</span>
                    <span className="ct-item-note">{hours.note}</span>
                  </span>
                </li>
              )}
            </ul>
          </aside>
        </div>
      </section>

      <style>{`
        .ct-hero { padding-block: var(--space-16) var(--space-10); }
        .ct-title { font-size: clamp(2.5rem, 8vw, 4.5rem); margin: 0 0 var(--space-4); }

        .ct-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: var(--space-12);
          align-items: start;
        }

        .ct-h2 {
          font-family: var(--font-body);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--brand-ink);
          margin: 0 0 var(--space-4);
        }

        .ct-h2-spaced { margin-top: var(--space-12); }

        .ct-p { margin: 0 0 var(--space-6); color: var(--text-muted); line-height: 1.75; max-width: 52ch; }

        .ct-social { display: grid; gap: var(--space-3); max-width: 420px; }

        .ct-social-row {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: inherit;
          transition: transform var(--duration-fast) var(--ease),
            border-color var(--duration-fast) var(--ease);
        }

        .ct-social-row:hover { transform: translateY(-2px); border-color: var(--glass-border-brand); }
        .ct-social-row > :last-child { margin-left: auto; color: var(--brand-ink); }

        .ct-social-icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          flex: none;
          border-radius: var(--radius);
          background: var(--glass-bg-brand);
          color: var(--brand-ink);
        }

        .ct-social-label { display: block; color: var(--text); font-weight: 600; font-size: 0.9rem; }
        .ct-social-handle { display: block; color: var(--text-faint); font-size: 0.8rem; }

        .ct-list { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-4); }

        .ct-item {
          display: flex;
          gap: var(--space-4);
          padding: var(--space-5);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: var(--bg-card);
        }

        .ct-item-muted { background: var(--surface); }

        .ct-item-icon {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          flex: none;
          border-radius: var(--radius);
          background: var(--surface);
          color: var(--text-muted);
        }

        .ct-item-label {
          display: block;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-faint);
          margin-bottom: var(--space-1);
        }

        .ct-item-value { display: block; color: var(--text); font-weight: 600; font-size: 0.95rem; }

        .ct-item-hours {
          display: flex;
          justify-content: space-between;
          gap: var(--space-4);
          font-weight: 500;
          font-size: 0.88rem;
        }

        .ct-link:hover { color: var(--brand-ink); }

        .ct-item-note {
          display: block;
          margin-top: var(--space-1);
          color: var(--text-faint);
          font-size: 0.8rem;
          line-height: 1.6;
        }

        .ct-slot {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-5);
          border: 1.5px dashed var(--border-light);
          border-radius: var(--radius-lg);
          background: var(--surface);
        }

        .ct-slot-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-faint);
        }

        .ct-slot-note { color: var(--text-muted); font-size: 0.82rem; line-height: 1.65; }

        .ct-slot code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.78em;
          padding: 1px 4px;
          border-radius: 3px;
          background: var(--bg-deep);
          color: var(--text-secondary);
        }

        @media (max-width: 900px) {
          .ct-grid { grid-template-columns: 1fr; gap: var(--space-10); }
        }
      `}</style>
    </>
  );
}
