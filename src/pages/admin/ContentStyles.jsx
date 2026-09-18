/* ===========================================================================
   Styles for the content screens.
   ---------------------------------------------------------------------------
   Kept separate from AdminStyles so the content system can be read, changed or
   removed as one piece. Every colour is a token that scripts/check-contrast.mjs
   already verifies; nothing here introduces a new pair.
   =========================================================================== */

export default function ContentStyles() {
  return (
    <style>{`
      /* --- section chrome ------------------------------------------- */
      .cf-blurb {
        margin: var(--space-2) 0 0;
        max-width: 60ch;
        color: var(--text-muted);
        font-size: 0.85rem;
        line-height: 1.6;
      }

      .cf-head-tools { display: flex; align-items: center; gap: var(--space-4); }

      .cf-save {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--text-muted);
        font-size: 0.76rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .cf-spin { animation: cf-rot 0.9s linear infinite; }
      @keyframes cf-rot { to { transform: rotate(360deg); } }

      .cf-dirty {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
        margin-bottom: var(--space-6);
        padding: var(--space-3) var(--space-4);
        border: 1px solid var(--border-light);
        border-radius: var(--radius);
        background: var(--bg-elevated);
        color: var(--text-secondary);
        font-size: 0.83rem;
      }

      .cf-dirty > span {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        min-width: 0;
      }

      /* --- form ------------------------------------------------------ */
      .cf-form {
        display: grid;
        gap: var(--space-6);
        max-width: 720px;
        padding-bottom: var(--space-24);
      }

      .cf-row { display: grid; gap: var(--space-2); min-width: 0; }

      .cf-label {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--space-3);
        color: var(--text);
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.04em;
      }

      .cf-count {
        color: var(--text-muted);
        font-family: var(--font-mono);
        font-size: 0.7rem;
        font-weight: 500;
      }

      .cf-help {
        margin: 0;
        color: var(--text-muted);
        font-size: 0.78rem;
        line-height: 1.55;
      }

      .cf-textarea { resize: vertical; min-height: 4.5rem; line-height: 1.6; }

      .cf-select { appearance: none; }

      .cf-money { display: flex; align-items: center; gap: var(--space-2); }
      .cf-money > span { color: var(--text-muted); font-family: var(--font-mono); }
      .cf-money .field-input { font-family: var(--font-mono); }

      /* --- toggle ---------------------------------------------------- */
      .cf-row-toggle { gap: var(--space-2); }

      .cf-switch {
        display: inline-flex;
        align-items: center;
        gap: var(--space-3);
        cursor: pointer;
      }

      .cf-switch input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
      }

      .cf-switch-track {
        position: relative;
        flex: none;
        width: 40px;
        height: 22px;
        border-radius: var(--radius-pill);
        border: 1px solid var(--border-light);
        background: var(--bg-deep);
        transition: background-color var(--duration-fast) var(--ease),
          border-color var(--duration-fast) var(--ease);
      }

      .cf-switch-knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--text-muted);
        transition: transform var(--duration-fast) var(--ease),
          background-color var(--duration-fast) var(--ease);
      }

      .cf-switch input:checked + .cf-switch-track {
        background: var(--brand);
        border-color: var(--brand);
      }

      .cf-switch input:checked + .cf-switch-track .cf-switch-knob {
        transform: translateX(18px);
        background: var(--on-primer);
      }

      .cf-switch input:focus-visible + .cf-switch-track {
        outline: 2px solid var(--brand);
        outline-offset: 2px;
      }

      .cf-switch-label { font-size: 0.86rem; font-weight: 500; }

      /* --- buttons --------------------------------------------------- */
      .cf-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-4);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-sm);
        background: var(--bg-elevated);
        color: var(--text);
        font-size: 0.8rem;
        font-weight: 600;
        white-space: nowrap;
        transition: background-color var(--duration-fast) var(--ease),
          border-color var(--duration-fast) var(--ease);
      }

      .cf-btn:hover:not(:disabled) { background: var(--hover-strong); }
      .cf-btn:disabled { opacity: 0.45; cursor: not-allowed; }

      .cf-btn-primary {
        background: var(--brand);
        border-color: var(--brand);
        color: var(--on-primer);
      }
      .cf-btn-primary:hover:not(:disabled) {
        background: var(--brand-light);
        border-color: var(--brand-light);
      }

      .cf-btn-quiet { background: transparent; }
      .cf-btn-add { justify-self: start; }

      .cf-icon-btn {
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border: 1px solid transparent;
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-muted);
      }
      .cf-icon-btn:hover:not(:disabled) { background: var(--hover-soft); color: var(--text); }
      .cf-icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      .cf-icon-danger:hover:not(:disabled) { background: var(--alert-tint); color: var(--alert-ink); }

      .cf-back {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-2);
        background: none;
        border: none;
        color: var(--text-muted);
        font-size: 0.78rem;
        font-weight: 600;
      }
      .cf-back:hover { color: var(--text); }

      /* --- repeatable lists ------------------------------------------ */
      .cf-list { display: grid; gap: var(--space-3); min-width: 0; }

      .cf-list-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--space-3);
      }

      .cf-list-count {
        color: var(--text-muted);
        font-family: var(--font-mono);
        font-size: 0.72rem;
      }

      .cf-item {
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--bg-card);
        overflow: hidden;
      }

      .cf-item-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
        padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
        border-bottom: 1px solid var(--border);
        background: var(--bg-elevated);
      }

      .cf-item-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--text-secondary);
        font-size: 0.78rem;
        font-weight: 600;
      }

      .cf-item-tools { display: flex; align-items: center; gap: 2px; flex: none; }

      .cf-item-body { display: grid; gap: var(--space-4); padding: var(--space-4); }

      .cf-empty {
        margin: 0;
        padding: var(--space-4);
        border: 1px dashed var(--border-light);
        border-radius: var(--radius);
        color: var(--text-muted);
        font-size: 0.82rem;
      }

      /* --- image field ------------------------------------------------ */
      .cf-img {
        display: grid;
        grid-template-columns: minmax(0, 140px) minmax(0, 1fr);
        gap: var(--space-4);
        align-items: start;
      }

      .cf-img-preview {
        display: grid;
        place-items: center;
        aspect-ratio: 4 / 3;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--bg-deep);
        overflow: hidden;
      }

      .cf-img-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }

      .cf-img-empty {
        color: var(--text-faint);
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .cf-img-side { display: grid; gap: var(--space-2); min-width: 0; }
      .cf-img-actions { display: flex; flex-wrap: wrap; gap: var(--space-2); }
      .cf-img-input { display: none; }

      .cf-img-note { margin: 0; color: var(--text-muted); font-size: 0.76rem; line-height: 1.5; }
      .cf-img-error { margin: 0; color: var(--alert-ink); font-size: 0.78rem; font-weight: 500; }

      /* --- gallery photograph grid ------------------------------------ */
      .cf-gallery { gap: var(--space-3); }

      .cf-thumbs {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(190px, 100%), 1fr));
        gap: var(--space-3);
      }

      .cf-thumb {
        display: grid;
        gap: var(--space-2);
        margin: 0;
        padding: var(--space-2);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--bg-card);
        min-width: 0;
      }

      .cf-thumb > img {
        width: 100%;
        aspect-ratio: 3 / 2;
        object-fit: cover;
        border-radius: 2px;
        background: var(--bg-deep);
        display: block;
      }

      .cf-thumb figcaption { display: grid; gap: var(--space-2); min-width: 0; }
      .cf-thumb-alt { font-size: 0.76rem; padding: var(--space-2); }
      .cf-thumb-tools { display: flex; gap: 2px; justify-content: flex-end; }

      .cf-thumb-add {
        place-items: center;
        align-content: center;
        aspect-ratio: 3 / 2;
        border-style: dashed;
        color: var(--text-muted);
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        text-align: center;
      }
      .cf-thumb-add:hover { color: var(--text); border-color: var(--border-light); }
      .cf-thumb-add input { display: none; }

      /* --- gallery list ----------------------------------------------- */
      .cf-detail-head { min-width: 0; }

      .cf-gal-rows { list-style: none; margin: 0; padding: 0 0 var(--space-24); display: grid; gap: var(--space-2); }

      .cf-gal-row {
        display: grid;
        grid-template-columns: 76px minmax(0, 1fr) auto;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-3);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--bg-card);
      }

      .cf-gal-row:hover { border-color: var(--border-light); }

      .cf-gal-thumb {
        display: grid;
        place-items: center;
        aspect-ratio: 3 / 2;
        border-radius: 2px;
        background: var(--bg-deep);
        overflow: hidden;
      }
      .cf-gal-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

      .cf-gal-nocover {
        color: var(--text-faint);
        font-size: 0.6rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .cf-gal-main {
        display: grid;
        gap: 3px;
        min-width: 0;
        text-align: left;
        background: none;
        border: none;
        padding: 0;
      }

      .cf-gal-title {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--text);
        font-size: 0.92rem;
        font-weight: 600;
      }

      .cf-gal-meta {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--text-muted);
        font-size: 0.76rem;
      }

      .cf-tag {
        padding: 1px var(--space-2);
        border-radius: var(--radius-pill);
        background: var(--glass-bg-brand);
        color: var(--brand-ink);
        font-size: 0.62rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      /* --- publish control in the sidebar ------------------------------ */
      /* Sticks to the bottom of the scrolling sidebar. The nav is long enough
         that a statically positioned publish button falls below the fold,
         which is the one control that must never be hard to find. */
      .ad-publish {
        position: sticky;
        bottom: 0;
        z-index: 2;
        display: grid;
        gap: var(--space-2);
        margin-inline: calc(var(--space-4) * -1);
        padding: var(--space-3) var(--space-4);
        border-top: 1px solid var(--border);
        background: var(--ground-deep);
      }

      .cf-publish-btn { width: 100%; justify-content: center; }
      .cf-publish-idle { background: var(--bg-elevated); border-color: var(--border); color: var(--text-muted); }

      .ad-publish-note {
        margin: 0;
        color: var(--text-muted);
        font-size: 0.7rem;
        line-height: 1.5;
      }

      .ad-nav-group {
        padding: var(--space-4) var(--space-4) var(--space-2);
        color: var(--text-faint);
        font-size: 0.64rem;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .ad-dot {
        width: 6px;
        height: 6px;
        margin-left: auto;
        border-radius: 50%;
        background: var(--brand);
        flex: none;
      }

      /* --- publish dialog ---------------------------------------------- */
      .cf-scrim {
        position: fixed;
        inset: 0;
        z-index: 300;
        display: grid;
        place-items: center;
        padding: var(--space-4);
        background: rgba(0, 0, 0, 0.6);
      }

      .cf-dialog {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
        width: min(520px, 100%);
        max-height: min(80vh, 640px);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        box-shadow: var(--shadow-chrome-strong);
        overflow: hidden;
      }

      .cf-dialog-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
        padding: var(--space-5) var(--space-4) var(--space-4) var(--space-5);
        border-bottom: 1px solid var(--border);
      }

      .cf-dialog-head h2 { margin: 0; font-size: 1.1rem; letter-spacing: 0.02em; }

      .cf-dialog-body { padding: var(--space-5); overflow-y: auto; }

      .cf-dialog-lead {
        margin: 0 0 var(--space-4);
        color: var(--text-secondary);
        font-size: 0.86rem;
        line-height: 1.6;
      }

      .cf-pub-list { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-2); }

      .cf-pub-row {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: var(--space-3);
        align-items: start;
        padding: var(--space-3);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--bg-card);
        cursor: pointer;
      }

      .cf-pub-row:hover { border-color: var(--border-light); }
      .cf-pub-row > span { display: grid; gap: 2px; min-width: 0; }

      .cf-pub-label { color: var(--text); font-size: 0.88rem; font-weight: 600; }

      .cf-pub-changed {
        color: var(--text-muted);
        font-size: 0.76rem;
        line-height: 1.5;
      }

      .cf-dialog-foot {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-2);
        padding: var(--space-4) var(--space-5);
        border-top: 1px solid var(--border);
        background: var(--bg-card);
      }

      /* --- publish history --------------------------------------------- */
      .cf-history {
        list-style: none;
        margin: 0;
        padding: 0 0 var(--space-24);
        display: grid;
        gap: var(--space-2);
      }

      .cf-history-item {
        display: grid;
        grid-template-columns: minmax(0, 180px) minmax(0, 1fr);
        gap: var(--space-5);
        padding: var(--space-4);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--bg-card);
      }

      .cf-history-when { display: grid; gap: 2px; min-width: 0; }
      .cf-history-rel { color: var(--text); font-size: 0.86rem; font-weight: 600; }
      .cf-history-abs { color: var(--text-muted); font-size: 0.72rem; }

      .cf-history-what { display: grid; gap: var(--space-3); min-width: 0; }
      .cf-history-section { display: grid; gap: 2px; min-width: 0; }
      .cf-history-label { color: var(--text-secondary); font-size: 0.82rem; font-weight: 600; }
      .cf-history-fields { color: var(--text-muted); font-size: 0.78rem; line-height: 1.5; }

      /* --- narrow ------------------------------------------------------ */
      @media (max-width: 720px) {
        .cf-img { grid-template-columns: minmax(0, 1fr); }
        .cf-gal-row { grid-template-columns: 60px minmax(0, 1fr); }
        .cf-gal-row .cf-item-tools { grid-column: 1 / -1; justify-content: flex-end; }
        .cf-history-item { grid-template-columns: minmax(0, 1fr); gap: var(--space-3); }
      }
    `}</style>
  );
}
