import { useState } from 'react';
import { Link } from 'react-router-dom';
import ChevronDown from '@untitled-ui/icons-react/build/esm/ChevronDown';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';

import Seo from '../components/Seo';
import { faqs, faqCategories } from '../data/faqs';

function Item({ faq, open, onToggle }) {
  const panelId = `faq-panel-${faq.id}`;
  const btnId = `faq-btn-${faq.id}`;

  return (
    <li className={`fq-item ${open ? 'fq-item-open' : ''}`}>
      <h3 className="fq-h">
        <button
          type="button"
          id={btnId}
          className="fq-btn"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>{faq.question}</span>
          <ChevronDown className="fq-chev" width={18} height={18} aria-hidden="true" />
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={btnId} className="fq-panel" hidden={!open}>
        <div className="fq-panel-inner">
          {faq.answer.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
      </div>
    </li>
  );
}

export default function Faq() {
  /* The most-asked question opens by default — making someone click to read the
     answer they came for is friction for nothing. */
  const [openId, setOpenId] = useState(faqs[0]?.id ?? null);

  return (
    <>
      <Seo
        title="FAQ"
        description="Common questions about booking a cinematic automotive photography session with Paps Productions."
      />

      <section className="fq-hero texture-trails">
        <div className="wrap">
          <span className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Questions
          </span>
          <h1 className="fq-title display">Frequently asked</h1>
          <p className="section-subtitle">
            If your question is not here, ask it directly — the answer is usually faster in person
            anyway.
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="wrap fq-wrap">
          {faqCategories.map((cat) => (
            <div key={cat} className="fq-group reveal">
              <h2 className="fq-cat">{cat}</h2>
              <ul className="fq-list">
                {faqs
                  .filter((f) => f.category === cat)
                  .map((f) => (
                    <Item
                      key={f.id}
                      faq={f}
                      open={openId === f.id}
                      onToggle={() => setOpenId(openId === f.id ? null : f.id)}
                    />
                  ))}
              </ul>
            </div>
          ))}

          <div className="fq-cta reveal">
            <h2 className="fq-cta-title">Still have a question?</h2>
            <p className="fq-cta-sub">
              Book a free consultation and ask it there. No card, no commitment.
            </p>
            <Link to="/book" className="btn btn-primary">
              Book a consultation
              <ArrowRight className="arrow" width={16} height={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .fq-hero { padding-block: var(--space-16) var(--space-10); }
        .fq-title { font-size: clamp(2.5rem, 8vw, 4.5rem); margin: 0 0 var(--space-4); }

        .fq-wrap { max-width: 820px; }

        .fq-group { margin-bottom: var(--space-12); }

        .fq-cat {
          font-family: var(--font-body);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--brand-ink);
          margin: 0 0 var(--space-4);
        }

        .fq-list { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-3); }

        .fq-item {
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-card);
          overflow: hidden;
          transition: border-color var(--duration-fast) var(--ease);
        }

        .fq-item:hover { border-color: var(--border-light); }
        .fq-item-open { border-color: var(--glass-border-brand); }

        .fq-h { margin: 0; }

        .fq-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          width: 100%;
          padding: var(--space-5);
          border: none;
          background: transparent;
          text-align: left;
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
          text-transform: none;
          letter-spacing: 0;
          line-height: 1.5;
        }

        .fq-btn:hover { background: var(--hover-soft); }

        .fq-chev {
          flex: none;
          color: var(--text-muted);
          transition: transform var(--duration) var(--ease), color var(--duration-fast) var(--ease);
        }

        .fq-item-open .fq-chev { transform: rotate(180deg); color: var(--brand-ink); }

        .fq-panel-inner {
          padding: 0 var(--space-5) var(--space-5);
          border-top: 1px solid var(--border);
          padding-top: var(--space-4);
          margin-top: 0;
        }

        .fq-panel-inner p {
          margin: 0 0 var(--space-3);
          color: var(--text-muted);
          line-height: 1.75;
          font-size: 0.94rem;
        }

        .fq-panel-inner p:last-child { margin-bottom: 0; }

        .fq-cta {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-8);
          border-radius: var(--radius-lg);
          border: 1px solid var(--glass-border-brand);
          background: var(--glass-bg-brand);
        }

        .fq-cta-title { margin: 0; font-size: 1.5rem; }
        .fq-cta-sub { margin: 0 0 var(--space-2); color: var(--text-muted); }
      `}</style>
    </>
  );
}
