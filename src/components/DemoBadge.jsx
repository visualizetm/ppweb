import { useEffect, useState } from 'react';
import XClose from '@untitled-ui/icons-react/build/esm/XClose';
import InfoCircle from '@untitled-ui/icons-react/build/esm/InfoCircle';

import { isDemo } from '../lib/dataSource';

/* ===========================================================================
   Demo badge.
   ---------------------------------------------------------------------------
   Renders nothing at all when isDemo is false, so the entire signalling layer
   disappears on promotion with no cleanup — no dead component, no leftover
   flag check inside a page.

   The client must never be confused about what they are looking at, and a real
   customer who stumbles on the URL must never mistake this for a live site.
   =========================================================================== */

export default function DemoBadge() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!isDemo) return null;

  return (
    <>
      <button
        type="button"
        className="db-badge"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="db-dot" aria-hidden="true" />
        Demo
      </button>

      {open && (
        <div className="db-scrim" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="db-panel glass-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="db-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="db-head">
              <span className="db-icon" aria-hidden="true">
                <InfoCircle width={18} height={18} />
              </span>
              <h2 id="db-title">This is a working preview</h2>
              <button type="button" className="db-close" onClick={() => setOpen(false)} aria-label="Close">
                <XClose width={18} height={18} aria-hidden="true" />
              </button>
            </div>

            <div className="db-body">
              <p>
                Everything on this site works — you can browse the galleries, run through the whole
                booking flow, and log into the dashboard. Click anything you like. You cannot break it.
              </p>
              <p>
                Nothing you do here is sent to anyone. Bookings are not emailed, no card is ever
                charged, and the bookings already in the dashboard are invented examples, not real
                customers. Everything resets when you close the tab.
              </p>
              <p className="db-note">
                Prices shown across the site are placeholders until Michael confirms his real ones.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .db-badge {
          position: fixed;
          left: var(--space-4);
          bottom: var(--space-4);
          z-index: 200;
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-pill);
          border: 1px solid var(--glass-border-brand);
          background: var(--chrome-solid);
          backdrop-filter: blur(var(--glass-blur));
          -webkit-backdrop-filter: blur(var(--glass-blur));
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          box-shadow: var(--shadow-chrome);
          transition: color var(--duration-fast) var(--ease),
            transform var(--duration-fast) var(--ease);
        }

        .db-badge:hover { color: var(--text); transform: translateY(-1px); }

        .db-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
          animation: pp-pulse 2.6s var(--ease) infinite;
        }

        .db-scrim {
          position: fixed;
          inset: 0;
          z-index: 210;
          display: grid;
          place-items: end start;
          padding: var(--space-4);
          background: rgba(0, 0, 0, 0.55);
        }

        .db-panel {
          width: min(440px, calc(100% - var(--space-8)));
          background: var(--bg-elevated);
          border-color: var(--border-light);
          box-shadow: var(--shadow-chrome-strong);
          margin-bottom: var(--space-12);
        }

        .db-head {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-5) var(--space-5) var(--space-3);
        }

        .db-icon { color: var(--brand-ink); display: grid; place-items: center; }

        .db-head h2 {
          flex: 1;
          margin: 0;
          font-size: 1.15rem;
          letter-spacing: 0.02em;
        }

        .db-close {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: var(--text-muted);
        }

        .db-close:hover { background: var(--hover-soft); color: var(--text); }

        .db-body { padding: 0 var(--space-5) var(--space-5); }

        .db-body p {
          margin: 0 0 var(--space-3);
          font-size: 0.9rem;
          line-height: 1.7;
          color: var(--text-secondary);
        }

        .db-note {
          padding-top: var(--space-3);
          border-top: 1px solid var(--border);
          color: var(--text-muted) !important;
          font-size: 0.84rem !important;
        }
      `}</style>
    </>
  );
}
