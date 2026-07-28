import { Link } from 'react-router-dom';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Check from '@untitled-ui/icons-react/build/esm/Check';
import XClose from '@untitled-ui/icons-react/build/esm/XClose';
import MessageSquare01 from '@untitled-ui/icons-react/build/esm/MessageSquare01';
import AlertCircle from '@untitled-ui/icons-react/build/esm/AlertCircle';

import Seo from '../components/Seo';
import { packageGroups, hasPlaceholderPricing } from '../data/packages';
import { addonsForPackage } from '../data/addons';
import { pricing, policy, site } from '../data/site';
import { formatMoney } from '../lib/format';

function PriceTag({ tier, isPlaceholder, quoteOnly }) {
  if (quoteOnly || tier.priceCents === null) {
    return <span className="sv-quote">Quoted individually</span>;
  }
  return (
    <span className="sv-price">
      {tier.priceFrom && <span className="sv-from">from</span>}
      {formatMoney(tier.priceCents)}
      {isPlaceholder && (
        <span className="sv-ph" title="Placeholder price — not yet confirmed by Michael">
          placeholder
        </span>
      )}
    </span>
  );
}

export default function Services() {
  return (
    <>
      <Seo
        title="Services & Pricing"
        description="Packages and pricing for automotive, portrait, wedding and event photography by Paps Productions, plus editing and retouching."
      />

      <section className="sv-hero texture-trails">
        <div className="wrap">
          <span className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Services &amp; pricing
          </span>
          <h1 className="sv-title display">What it costs</h1>
          <p className="section-subtitle">
            Published, not hidden behind an enquiry form. Every session includes full editing on
            everything delivered, and every booking can start with a free consultation.
          </p>

          {hasPlaceholderPricing && (
            <p className="sv-warning">
              <AlertCircle width={16} height={16} aria-hidden="true" />
              <span>
                <strong>Placeholder pricing.</strong> The figures marked below are stand-ins so the
                booking system could be built and tested. They are not Michael&rsquo;s real prices
                and must be replaced before this site goes live.
              </span>
            </p>
          )}
        </div>
      </section>

      {packageGroups.map((group) => (
        <section key={group.id} className="section section-tight" aria-labelledby={`grp-${group.id}`}>
          <div className="wrap">
            <div className="sv-group-head reveal">
              <h2 id={`grp-${group.id}`} className="sv-group-title">
                {group.title}
              </h2>
              <p className="sv-group-blurb">{group.blurb}</p>
            </div>

            <div className="sv-packages">
              {group.items.map((pkg) => {
                const extras = addonsForPackage(pkg);
                return (
                  <article key={pkg.slug} id={pkg.slug} className="sv-pkg reveal">
                    <header className="sv-pkg-head">
                      <div>
                        <h3 className="sv-pkg-name">{pkg.name}</h3>
                        <p className="sv-pkg-tag">{pkg.tagline}</p>
                      </div>
                      {!pkg.allowsDirectBooking && (
                        <span className="sv-consult">
                          <MessageSquare01 width={13} height={13} aria-hidden="true" />
                          Consultation first
                        </span>
                      )}
                    </header>

                    <p className="sv-pkg-summary">{pkg.summary}</p>

                    {pkg.consultationReason && (
                      <p className="sv-pkg-why">{pkg.consultationReason}</p>
                    )}

                    <div className="sv-tiers">
                      {pkg.tiers.map((tier) => (
                        <div
                          key={tier.id}
                          className={`sv-tier ${tier.recommended ? 'sv-tier-rec' : ''}`}
                        >
                          {tier.recommended && <span className="sv-rec">Most booked</span>}
                          <div className="sv-tier-head">
                            <h4 className="sv-tier-name">{tier.name}</h4>
                            <PriceTag
                              tier={tier}
                              isPlaceholder={pkg.priceIsPlaceholder}
                              quoteOnly={pkg.quoteOnly || tier.quoteOnly}
                            />
                          </div>
                          <p className="sv-tier-meta">
                            {tier.durationLabel}
                            {tier.locations ? ` · ${tier.locations} location${tier.locations > 1 ? 's' : ''}` : ''}
                          </p>
                          <p className="sv-tier-blurb">{tier.blurb}</p>
                          <ul className="sv-includes">
                            {tier.includes.map((inc) => (
                              <li key={inc}>
                                <Check width={14} height={14} aria-hidden="true" />
                                {inc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {pkg.notIncluded?.length > 0 && (
                      <ul className="sv-excludes">
                        {pkg.notIncluded.map((x) => (
                          <li key={x}>
                            <XClose width={13} height={13} aria-hidden="true" />
                            {x}
                          </li>
                        ))}
                      </ul>
                    )}

                    {extras.length > 0 && (
                      <details className="sv-addons">
                        <summary>Add-ons available ({extras.length})</summary>
                        <ul>
                          {extras.map((a) => (
                            <li key={a.id}>
                              <span className="sv-addon-name">{a.name}</span>
                              <span className="sv-addon-price">
                                {formatMoney(a.priceCents)}
                                <span className="sv-addon-unit"> {a.unit}</span>
                                {a.priceIsPlaceholder && <span className="sv-ph">placeholder</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}

                    <Link
                      to={`/book?package=${pkg.slug}`}
                      className={`btn ${pkg.allowsDirectBooking ? 'btn-primary' : 'btn-secondary'} sv-pkg-cta`}
                    >
                      {pkg.allowsDirectBooking ? `Book a ${pkg.shortName.toLowerCase()} shoot` : 'Book a consultation'}
                      <ArrowRight className="arrow" width={16} height={16} aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* --- The rules that apply to everything --- */}
      <section className="section section-dark">
        <div className="wrap sv-rules-wrap">
          <h2 className="section-title reveal">Deposit, travel and turnaround</h2>

          <div className="sv-rules stagger">
            <div className="sv-rule">
              <h3>Deposit</h3>
              <p className="sv-rule-value">
                {formatMoney(pricing.depositCents)}
                {pricing.depositIsPlaceholder && <span className="sv-ph">placeholder</span>}
              </p>
              <p>
                Flat, whatever the package. It holds your date and comes off the balance — it is not
                an extra charge. Consultations never require one.
              </p>
            </div>

            <div className="sv-rule">
              <h3>Travel</h3>
              <p className="sv-rule-value">
                Free within {pricing.travel.freeRadiusMiles} mi
                {pricing.travel.isPlaceholder && <span className="sv-ph">placeholder</span>}
              </p>
              <p>
                {pricing.travel.description} Beyond that it is a flat{' '}
                {formatMoney(pricing.travel.feeCents)}, up to {site.serviceArea.maxRadiusMiles} miles.
              </p>
            </div>

            <div className="sv-rule">
              <h3>Turnaround</h3>
              <p className="sv-rule-value">
                {pricing.turnaround.standardDays} days
                {pricing.turnaround.isPlaceholder && <span className="sv-ph">placeholder</span>}
              </p>
              <p>
                {pricing.turnaround.description} Rush turnaround in{' '}
                {pricing.turnaround.rushDays} days is available as an add-on.
              </p>
            </div>
          </div>

          <div className="sv-policy reveal">
            <h3 className="sv-policy-title">{policy.headline}</h3>
            <ul>
              {policy.points.map((p) => (
                <li key={p.title}>
                  <strong>{p.title}.</strong> {p.body}
                </li>
              ))}
            </ul>
            {policy.isPlaceholder && (
              <p className="sv-policy-note">
                <AlertCircle width={14} height={14} aria-hidden="true" />
                Placeholder wording — Michael to confirm or rewrite before launch.
              </p>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .sv-hero { padding-block: var(--space-16) var(--space-10); }
        .sv-title { font-size: clamp(2.5rem, 8vw, 4.5rem); margin: 0 0 var(--space-4); }

        .sv-warning {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          margin: var(--space-8) 0 0;
          padding: var(--space-4) var(--space-5);
          border-radius: var(--radius);
          border: 1px solid color-mix(in srgb, var(--warning) 40%, transparent);
          background: color-mix(in srgb, var(--warning) 10%, transparent);
          color: var(--text-secondary);
          font-size: 0.86rem;
          line-height: 1.65;
          max-width: 72ch;
        }

        .sv-warning svg { flex: none; color: var(--warning); margin-top: 2px; }

        .sv-group-head { margin-bottom: var(--space-8); }

        .sv-group-title {
          font-size: clamp(1.5rem, 3.5vw, 2rem);
          margin: 0 0 var(--space-2);
          color: var(--brand-ink);
        }

        .sv-group-blurb { margin: 0; color: var(--text-muted); }

        .sv-packages { display: grid; gap: var(--space-6); }

        .sv-pkg {
          padding: var(--space-8);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: var(--bg-card);
          scroll-margin-top: 100px;
        }

        .sv-pkg-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-4);
          flex-wrap: wrap;
          margin-bottom: var(--space-4);
        }

        .sv-pkg-name { margin: 0 0 var(--space-1); font-size: 1.6rem; }
        .sv-pkg-tag { margin: 0; color: var(--brand-ink); font-size: 0.9rem; }

        .sv-consult {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 3px var(--space-3);
          border-radius: var(--radius-pill);
          border: 1px solid var(--border-light);
          background: var(--surface);
          color: var(--text-muted);
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .sv-pkg-summary {
          margin: 0 0 var(--space-5);
          color: var(--text-muted);
          line-height: 1.75;
          max-width: 72ch;
        }

        .sv-pkg-why {
          margin: 0 0 var(--space-6);
          padding: var(--space-3) var(--space-4);
          border-left: 2px solid var(--brand);
          background: var(--surface);
          border-radius: 0 var(--radius) var(--radius) 0;
          color: var(--text-secondary);
          font-size: 0.88rem;
        }

        .sv-tiers {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-5);
        }

        .sv-tier {
          position: relative;
          padding: var(--space-5);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: var(--surface);
        }

        .sv-tier-rec { border-color: var(--glass-border-brand); }

        .sv-rec {
          position: absolute;
          top: calc(var(--space-3) * -1);
          left: var(--space-4);
          padding: 2px var(--space-3);
          border-radius: var(--radius-pill);
          background: var(--brand);
          color: #06090f;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .sv-tier-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: var(--space-3);
          flex-wrap: wrap;
          margin-bottom: var(--space-2);
        }

        .sv-tier-name { margin: 0; font-size: 1.05rem; }

        .sv-price {
          display: inline-flex;
          align-items: baseline;
          gap: var(--space-2);
          font-family: var(--font-display);
          font-size: 1.45rem;
          font-weight: 700;
          color: var(--text);
        }

        .sv-from {
          font-family: var(--font-body);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-faint);
        }

        .sv-quote { color: var(--text-muted); font-size: 0.88rem; font-weight: 500; }

        .sv-ph {
          font-family: var(--font-body);
          font-size: 0.55rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--warning);
          border: 1px dashed color-mix(in srgb, var(--warning) 50%, transparent);
          border-radius: var(--radius-sm);
          padding: 1px 5px;
          margin-left: var(--space-2);
          white-space: nowrap;
        }

        .sv-tier-meta {
          margin: 0 0 var(--space-3);
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-faint);
        }

        .sv-tier-blurb { margin: 0 0 var(--space-4); color: var(--text-muted); font-size: 0.88rem; }

        .sv-includes, .sv-excludes {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: var(--space-2);
        }

        .sv-includes li, .sv-excludes li {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          font-size: 0.86rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .sv-includes svg { flex: none; color: var(--success); margin-top: 3px; }

        .sv-excludes {
          margin-bottom: var(--space-5);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
        }

        .sv-excludes li { color: var(--text-faint); font-size: 0.82rem; }
        .sv-excludes svg { flex: none; margin-top: 3px; }

        .sv-addons { margin-bottom: var(--space-6); }

        .sv-addons summary {
          cursor: pointer;
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--brand-ink);
          padding: var(--space-2) 0;
        }

        .sv-addons ul {
          list-style: none;
          margin: var(--space-3) 0 0;
          padding: 0;
          display: grid;
          gap: var(--space-2);
        }

        .sv-addons li {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: var(--space-4);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-sm);
          background: var(--surface);
          font-size: 0.85rem;
        }

        .sv-addon-name { color: var(--text-secondary); }
        .sv-addon-price { color: var(--text); font-weight: 600; white-space: nowrap; }
        .sv-addon-unit { color: var(--text-faint); font-weight: 400; font-size: 0.76rem; }

        .sv-rules-wrap { max-width: 1000px; }

        .sv-rules {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: var(--space-5);
          margin: var(--space-10) 0 var(--space-12);
        }

        .sv-rule {
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: var(--bg-card);
        }

        .sv-rule h3 {
          margin: 0 0 var(--space-3);
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-faint);
        }

        .sv-rule-value {
          margin: 0 0 var(--space-3);
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text);
          line-height: 1;
        }

        .sv-rule p { margin: 0; color: var(--text-muted); font-size: 0.88rem; line-height: 1.7; }

        .sv-policy {
          padding: var(--space-8);
          border-radius: var(--radius-lg);
          border: 1px solid var(--glass-border-brand);
          background: var(--glass-bg-brand);
        }

        .sv-policy-title { margin: 0 0 var(--space-5); font-size: 1.35rem; }

        .sv-policy ul { margin: 0; padding-left: var(--space-5); display: grid; gap: var(--space-3); }

        .sv-policy li { color: var(--text-secondary); line-height: 1.7; font-size: 0.92rem; }
        .sv-policy strong { color: var(--text); }

        .sv-policy-note {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin: var(--space-5) 0 0;
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
          color: var(--warning);
          font-size: 0.8rem;
        }

        .sv-pkg-cta { margin-top: var(--space-2); }
      `}</style>
    </>
  );
}
