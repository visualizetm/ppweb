/* Admin styling. Reskinned into Direction B — the sidebar is a darker plate on
   the same grey card, surfaces are stamped rather than glassy, and every
   number is set in the mono utility face. Same layout language as the
   reference: sidebar with search and grouped nav, tab row, horizontally
   scrolling stat cards, feed of item cards, right rail. */
export default function AdminStyles() {
  return (
    <style>{`
      .ad-boot { min-height: 100dvh; background: var(--ground); }

      /* --- login --- */
      .ad-login { min-height: 100dvh; display: grid; place-items: center; background: var(--ground-deep); padding: var(--space-6); }
      .ad-login-box { width: min(380px, 100%); padding: var(--space-8); display: grid; gap: var(--space-4); }
      .ad-login-icon { display: grid; place-items: center; width: 40px; height: 40px; border-radius: var(--radius);
        background: var(--panel-high); color: var(--ink); }
      .ad-login-title { margin: 0; font-family: var(--font-display); font-variation-settings: 'wdth' var(--wdth-display);
        font-weight: 800; text-transform: uppercase; font-size: 1.5rem; color: var(--ink); line-height: 1; }
      .ad-login-sub { margin: -8px 0 0; font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.18em;
        text-transform: uppercase; color: var(--ink-soft); }
      .ad-login-err { margin: 0; color: var(--alert-ink); font-size: 0.85rem; font-weight: 500; line-height: 1.5; overflow-wrap: anywhere; }
      .ad-login-hint { display: flex; gap: var(--space-3); margin: var(--space-2) 0 0; padding-top: var(--space-4);
        border-top: 1px solid var(--edge); font-size: 0.8rem; color: var(--ink-soft); line-height: 1.55; }
      .ad-login-hint svg { flex: none; margin-top: 2px; }
      .ad-field { display: grid; gap: var(--space-2); }
      .ad-label { font-family: var(--font-mono); font-size: 0.62rem; font-weight: 500; letter-spacing: 0.16em;
        text-transform: uppercase; color: var(--ink-soft); }

      /* --- shell --- */
      .ad { display: grid; grid-template-columns: 245px 1fr; min-height: 100dvh; background: var(--ground); }

      .ad-side { display: flex; flex-direction: column; gap: var(--space-5); padding: var(--space-4);
        background: var(--ground-deep); border-right: 1px solid var(--edge-strong); position: sticky; top: 0; height: 100dvh; overflow-y: auto; }
      .ad-side-top { display: flex; align-items: center; gap: var(--space-3); }
      .ad-mark { width: 28px; height: 28px; border-radius: var(--radius); background-color: var(--ink);
        -webkit-mask: url('/brand/logo.svg') center/contain no-repeat; mask: url('/brand/logo.svg') center/contain no-repeat; }
      .ad-side-name { font-family: var(--font-display); font-variation-settings: 'wdth' var(--wdth-plate);
        font-weight: 800; text-transform: uppercase; color: var(--ink); }

      .ad-search { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3);
        background: var(--panel); border: 1px solid var(--edge-strong); border-radius: var(--radius); color: var(--ink-soft); }
      .ad-search-input { flex: 1; min-width: 0; border: none; background: none; outline: none; font-size: 0.85rem; color: var(--ink); }
      .ad-keys { display: flex; gap: 2px; }
      .ad-keys kbd { font-family: var(--font-mono); font-size: 0.58rem; padding: 1px 4px; border-radius: 2px;
        background: var(--ground-deep); border: 1px solid var(--edge); color: var(--ink-soft); }

      .ad-nav { display: grid; gap: 2px; }
      .ad-nav-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) var(--space-3);
        border: 1px solid transparent; border-radius: var(--radius); background: none; color: var(--ink-soft);
        font-size: 0.85rem; font-weight: 500; text-align: left; width: 100%;
        transition: background-color var(--duration-fast) var(--ease), color var(--duration-fast) var(--ease); }
      .ad-nav-item:hover { background: var(--panel); color: var(--ink); }
      /* The active page is ink on ground, the same weight the active tab and
         pipeline step already use, so the current page reads at a glance. */
      .ad-nav-on { background: var(--ink); border-color: var(--ink); color: var(--ground); box-shadow: var(--lift-1); }
      .ad-nav-on:hover { background: var(--ink); color: var(--ground); }
      .ad-nav-rule { display: block; height: 1px; background: var(--edge); margin: var(--space-2) 0; }

      /* Collapsible groups. The toggle is a nav item with a chevron; the
         children indent one icon width so they read as belonging to it. */
      .ad-group { display: grid; gap: 2px; }
      .ad-group-toggle { color: var(--ink); font-weight: 600; }
      .ad-group-active:not(.ad-nav-on) { background: var(--panel); border-color: var(--edge); }
      .ad-group-chev { margin-left: auto; display: inline-grid; place-items: center; color: var(--ink-soft); }
      .ad-group-toggle .ad-dot { margin-left: auto; }
      .ad-group-toggle .ad-dot + .ad-group-chev { margin-left: 0; }
      .ad-group-items { display: grid; gap: 2px; padding-left: var(--space-3); margin-left: var(--space-3);
        border-left: 1px solid var(--edge); }
      .ad-group-items[hidden] { display: none; }
      .ad-nav-sub { font-size: 0.82rem; font-weight: 500; padding-block: 6px; }
      .ad-count { margin-left: auto; min-width: 18px; padding: 0 5px; border-radius: 2px; background: var(--primer);
        color: var(--on-primer); font-family: var(--font-mono); font-size: 0.62rem; text-align: center; line-height: 17px; }

      .ad-week-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3); }
      .ad-plus { color: var(--ink-soft); }
      .ad-week-row { display: flex; align-items: center; gap: var(--space-2); width: 100%; padding: var(--space-2);
        background: none; border: none; border-radius: var(--radius); color: var(--ink-soft); font-size: 0.8rem; text-align: left; }
      .ad-week-row:hover { background: var(--panel); }
      .ad-week-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ink); }
      .ad-week-mini { display: flex; align-items: flex-end; gap: 2px; height: 18px; }
      .ad-week-mini span { width: 3px; background: var(--ink-faint); border-radius: 1px; }
      .ad-empty-mini { margin: 0; font-size: 0.78rem; color: var(--ink-soft); }

      .ad-side-foot { margin-top: auto; display: grid; gap: var(--space-1); }
      .ad-reset { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3);
        background: none; border: 1px solid var(--edge); border-radius: var(--radius);
        color: var(--ink-soft); font-size: 0.78rem; text-align: left; }
      .ad-reset:hover { background: var(--panel); color: var(--ink); }

      /* --- main --- */
      .ad-main { padding: var(--space-6) var(--space-6) var(--space-16); min-width: 0; }
      .ad-head { margin-bottom: var(--space-6); }
      .ad-head-row { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }
      .ad-head-row > div { min-width: 0; }
      .ad-head-row > .ad-viewall { flex: none; margin-top: var(--space-1); }
      .ad-title { font-family: var(--font-display); font-variation-settings: 'wdth' var(--wdth-display);
        font-weight: 800; text-transform: uppercase; font-size: clamp(1.6rem, 3vw, 2.2rem);
        line-height: 1; color: var(--ink); margin: 0 0 var(--space-4); }
      .ad-tabs { display: flex; gap: var(--space-1); flex-wrap: wrap; }
      .ad-tab { padding: var(--space-2) var(--space-4); border: none; border-radius: var(--radius);
        background: none; color: var(--ink-soft); font-size: 0.85rem; font-weight: 500; }
      .ad-tab:hover { color: var(--ink); }
      .ad-tab-on { background: var(--ink); color: var(--ground); }
      .ad-tab-n { margin-left: var(--space-2); font-family: var(--font-mono); font-size: 0.68rem; opacity: 0.7; }
      .ad-tabs + .ad-table, .ad-tabs + .ad-skel-rows, .ad-tabs + .ad-empty { margin-top: var(--space-5); }

      /* --- bookings table ------------------------------------------------ */
      .ad-table-bookings tr { cursor: pointer; }
      .ad-table-bookings tbody tr:hover td { background: var(--panel); }
      .ad-row-unread .ad-who-name { font-weight: 700; }
      .ad-row-unread td:first-child { box-shadow: inset 3px 0 0 var(--primer); }
      .ad-who { display: inline-flex; align-items: center; gap: var(--space-3); min-width: 0; }
      .ad-who > span:last-child { display: grid; min-width: 0; }
      .ad-who-name { display: block; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ad-who-sub { font-size: 0.7rem; color: var(--ink-soft); }
      .ad-badge-inline { margin-left: var(--space-2); }

      /* --- pagination ---------------------------------------------------- */
      .ad-pager { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
        padding-top: var(--space-4); margin-top: var(--space-2); border-top: 1px solid var(--edge); }
      .ad-pager-range { font-size: 0.78rem; color: var(--ink-soft); }
      .ad-pager-btns { display: inline-flex; align-items: center; gap: var(--space-2); }
      .ad-pager-page { font-size: 0.78rem; color: var(--ink-soft); min-width: 4ch; text-align: center; }
      .ad-pager .cf-icon-btn:disabled { opacity: 0.4; cursor: default; }

      .ad-stats-wrap { margin-bottom: var(--space-8); }
      .ad-stats { gap: var(--space-3); }
      .ad-stat { width: 232px; padding: var(--space-4); background: var(--panel);
        border: 1px solid var(--edge); border-radius: var(--radius-lg); box-shadow: var(--lift-1);
        display: grid; gap: var(--space-2); align-content: start; }
      .ad-stat-num { font-size: 1.75rem; font-weight: 700; color: var(--ink); line-height: 1; }
      .ad-stat-foot { display: flex; align-items: center; gap: var(--space-2); min-height: 30px; }
      .ad-stat-sub { font-size: 0.75rem; color: var(--ink-soft); }
      .ad-bars { display: flex; align-items: flex-end; gap: 2px; height: 28px; margin-left: auto; }
      .ad-bar { width: 4px; background: var(--ink-faint); border-radius: 1px; }
      .ad-curve { width: 70px; height: 28px; margin-left: auto; color: var(--ink-faint); }
      .ad-stack { display: flex; margin-left: auto; }
      .ad-stack > * { margin-left: -7px; box-shadow: 0 0 0 2px var(--panel); }
      .ad-more { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%;
        background: var(--ground-deep); font-size: 0.6rem; color: var(--ink-soft); margin-left: -7px; }

      .ad-cols { display: grid; grid-template-columns: 1fr 220px; gap: var(--space-6); align-items: start; }
      .ad-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); }
      .ad-h2 { margin: 0; font-size: 1.05rem; color: var(--ink); }
      .ad-h3 { margin: var(--space-5) 0 var(--space-2); font-size: 0.9rem; color: var(--ink); }
      .ad-viewall { padding: var(--space-1) var(--space-3); background: var(--panel); border: 1px solid var(--edge-strong);
        border-radius: var(--radius); color: var(--ink-soft); font-size: 0.75rem; }
      .ad-viewall:hover { background: var(--panel-high); color: var(--ink); }

      .ad-feed { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-3); }
      .ad-card { display: grid; gap: var(--space-3); width: 100%; padding: var(--space-4); text-align: left;
        background: var(--panel); border: 1px solid var(--edge); border-radius: var(--radius-lg);
        box-shadow: var(--lift-1);
        transition: transform var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease); }
      .ad-card:hover { transform: translateY(-1px); box-shadow: var(--lift-2); }
      .ad-card-unread { border-left: 3px solid var(--primer); }
      .ad-card-top { display: flex; align-items: center; justify-content: space-between; }
      .ad-when { display: inline-flex; align-items: center; gap: var(--space-2); padding: 2px var(--space-2);
        background: var(--panel-high); border-radius: var(--radius-sm); font-family: var(--font-mono);
        font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); }
      .ad-card-meta { display: flex; gap: var(--space-3); color: var(--ink-soft); font-size: 0.72rem; }
      .ad-card-meta span { display: inline-flex; align-items: center; gap: 3px; }
      .ad-card-title { font-size: 1rem; font-weight: 700; color: var(--ink); overflow: hidden;
        text-overflow: ellipsis; white-space: nowrap; }
      .ad-card-foot { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
      .ad-tags { display: flex; gap: var(--space-2); flex-wrap: wrap; }

      .ad-avatar { display: inline-grid; place-items: center; border-radius: 50%; flex: none;
        background: var(--ground-deep); color: var(--ink); font-family: var(--font-mono); font-weight: 500; }

      .ad-rail { display: grid; gap: var(--space-3); }
      .ad-rail-card { padding: var(--space-4); background: var(--panel); border: 1px solid var(--edge);
        border-radius: var(--radius-lg); display: grid; gap: var(--space-2); }
      .ad-rail-big { margin: 0; font-family: var(--font-mono); font-size: 1.6rem; font-weight: 600; color: var(--ink); line-height: 1; }
      .ad-rail-big span { font-size: 0.9rem; color: var(--ink-soft); }
      .ad-rail-sub { margin: 0; font-size: 0.75rem; color: var(--ink-soft); }
      .ad-rail-row { display: flex; align-items: center; gap: var(--space-2); font-size: 0.78rem; color: var(--ink-soft); }
      .ad-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ok-ink); margin-left: auto; }
      .ad-rail-msg { display: flex; gap: var(--space-2); font-size: 0.76rem; }
      .ad-rail-msg strong { display: block; color: var(--ink); font-size: 0.8rem; }
      .ad-rail-preview { color: var(--ink-soft); line-height: 1.4; }

      /* --- states --- */
      .ad-skeletons { display: grid; gap: var(--space-3); }
      .ad-skel { display: block; height: 92px; border-radius: var(--radius-lg); background: var(--panel);
        animation: ad-pulse 1.4s var(--ease) infinite; }
      .ad-skel-num { height: 28px; width: 70%; }
      @keyframes ad-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }

      .ad-empty { padding: var(--space-8); background: var(--panel); border: 1px dashed var(--edge-strong);
        border-radius: var(--radius-lg); }
      .ad-empty-page { max-width: 640px; }
      .ad-empty h3 { margin: 0 0 var(--space-2); font-size: 1.05rem; color: var(--ink); }
      .ad-empty p { margin: 0; color: var(--ink-soft); font-size: 0.88rem; line-height: 1.6; }
      .ad-empty code { font-family: var(--font-mono); font-size: 0.82em; }
      .ad-gal-list { list-style: none; margin: var(--space-4) 0 0; padding: 0; display: grid; gap: var(--space-2); }
      .ad-gal-list li { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--ink-soft);
        padding-bottom: var(--space-2); border-bottom: 1px solid var(--edge-hair); }

      /* --- detail --- */
      .ad-detail { display: grid; gap: var(--space-5); }
      .ad-back { display: inline-flex; align-items: center; gap: var(--space-2); background: none; border: none;
        color: var(--ink-soft); font-size: 0.85rem; padding: 0; justify-self: start; }
      .ad-back:hover { color: var(--ink); }
      .ad-ref { font-size: 0.75rem; color: var(--ink-soft); }
      .ad-detail-sub { margin: 0; color: var(--ink-soft); font-size: 0.88rem; }

      .ad-pipeline { display: flex; flex-wrap: wrap; gap: var(--space-1); }
      .ad-pip { display: inline-flex; align-items: center; gap: 4px; padding: var(--space-2) var(--space-3);
        background: var(--panel); border: 1px solid var(--edge); border-radius: var(--radius);
        font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.06em; text-transform: uppercase;
        color: var(--ink-soft); }
      .ad-pip:hover { background: var(--panel-high); color: var(--ink); }
      .ad-pip-done { color: var(--ink); }
      .ad-pip-now { background: var(--ink); border-color: var(--ink); color: var(--ground); }
      .ad-pip-cancel { margin-left: auto; }

      .ad-detail-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: var(--space-4); align-items: start; }
      .ad-panel { padding: var(--space-5); background: var(--panel); border: 1px solid var(--edge);
        border-radius: var(--radius-lg); display: grid; gap: var(--space-3); align-content: start; }
      .ad-panel-sub { margin: 0; font-size: 0.83rem; color: var(--ink-soft); }
      .ad-facts { margin: 0; display: grid; gap: var(--space-2); }
      .ad-facts > div { display: flex; justify-content: space-between; gap: var(--space-4);
        padding-bottom: var(--space-2); border-bottom: 1px solid var(--edge-hair); }
      .ad-facts dt { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.14em;
        text-transform: uppercase; color: var(--ink-soft); }
      .ad-facts dd { margin: 0; font-size: 0.86rem; color: var(--ink); text-align: right; }
      .ad-quote { margin: 0; padding: var(--space-3) var(--space-4); background: var(--ground-deep);
        border-left: 2px solid var(--ink); border-radius: 0 var(--radius) var(--radius) 0;
        color: var(--ink-soft); font-size: 0.87rem; line-height: 1.6; }

      .ad-lines { display: grid; gap: var(--space-2); }
      .ad-line { display: grid; grid-template-columns: 1fr 70px 100px 32px; gap: var(--space-2); align-items: center; }
      .ad-line-del { display: grid; place-items: center; height: 36px; background: none;
        border: 1px solid var(--edge); border-radius: var(--radius); color: var(--ink-soft); }
      .ad-line-del:hover { background: var(--alert-tint); color: var(--alert-ink); }
      .ad-addline { display: inline-flex; align-items: center; gap: var(--space-2); justify-self: start;
        padding: var(--space-2) var(--space-3); background: none; border: 1px dashed var(--edge-strong);
        border-radius: var(--radius); color: var(--ink-soft); font-size: 0.8rem; }
      .ad-addline:hover { background: var(--panel-high); color: var(--ink); }
      .ad-quote-foot { display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--space-4);
        padding-top: var(--space-4); border-top: 1px solid var(--edge); }
      .ad-inline { display: grid; gap: var(--space-1); }
      .ad-quote-total { display: grid; gap: 2px; margin-left: auto; text-align: right; }
      .ad-quote-total .data { font-size: 1.35rem; font-weight: 700; color: var(--ink); }

      .ad-sendpanel { border-color: var(--ink); }
      .ad-linkrow { display: flex; gap: var(--space-2); }
      .ad-linkrow input { flex: 1; min-width: 0; font-size: 0.78rem; }
      .ad-msgs { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-top: var(--space-2); }
      .ad-msgs > div { display: grid; gap: var(--space-2); justify-items: start; }
      .ad-msg { margin: 0; padding: var(--space-3); background: var(--ground-deep); border: 1px solid var(--edge);
        border-radius: var(--radius); font-family: var(--font-body); font-size: 0.78rem; color: var(--ink-soft);
        white-space: pre-wrap; line-height: 1.5; width: 100%; }

      .ad-invlist { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-2); }
      .ad-invlist li { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap;
        padding-bottom: var(--space-2); border-bottom: 1px solid var(--edge-hair); font-size: 0.83rem; color: var(--ink); }
      .ad-inv-when { color: var(--ink-soft); font-size: 0.78rem; margin-left: auto; }

      .ad-table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
      .ad-table th { text-align: left; font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.14em;
        text-transform: uppercase; color: var(--ink-soft); font-weight: 500; padding-bottom: var(--space-3); }
      .ad-table td { padding: var(--space-3) var(--space-2); border-top: 1px solid var(--edge-hair); color: var(--ink); }
      .ad-r { text-align: right; }
      .ad-muted { color: var(--ink-soft); }

      .ad-toast { position: fixed; bottom: var(--space-6); right: var(--space-6); z-index: 300;
        padding: var(--space-3) var(--space-5); background: var(--ink); color: var(--ground);
        border-radius: var(--radius); box-shadow: var(--lift-3); font-size: 0.85rem; font-weight: 500;
        animation: ad-toast-in var(--duration) var(--ease) both; }
      @keyframes ad-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

      .bk-spin { animation: bk-spin 0.9s linear infinite; }
      @keyframes bk-spin { to { transform: rotate(360deg); } }

      @media (max-width: 1080px) {
        .ad-cols { grid-template-columns: 1fr; }
        .ad-detail-grid, .ad-msgs { grid-template-columns: 1fr; }
      }
      /* --- mobile top bar + drawer -------------------------------------
         Desktop keeps the sticky sidebar column. Below 860px the sidebar
         used to stack ABOVE the content, which put every page a full scroll
         away and made switching pages a scroll back up. Now the sidebar is a
         drawer behind a Menu button and the content starts under a short
         sticky bar. */
      .ad-topbar { display: none; }
      .ad-scrim { display: none; }

      @media (max-width: 860px) {
        .ad { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }

        .ad-topbar {
          position: sticky; top: 0; z-index: 60;
          display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          background: var(--ground-deep); border-bottom: 1px solid var(--edge-strong);
        }
        .ad-topbar-menu {
          display: grid; place-items: center; width: 40px; height: 40px;
          border: 1px solid var(--edge); border-radius: var(--radius); background: var(--panel); color: var(--ink);
        }
        .ad-topbar-title {
          min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          font-family: var(--font-display); font-variation-settings: 'wdth' var(--wdth-plate);
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ink);
        }
        .ad-topbar-publish { height: 40px; padding-inline: var(--space-3); }

        /* The sidebar is a drawer: hidden unless open, then fixed over the page. */
        .ad-side { display: none; }
        .ad-side.ad-side-open {
          display: flex; position: fixed; top: 0; left: 0; bottom: 0; z-index: 80;
          width: min(320px, 88vw); height: 100dvh; overflow-y: auto;
          box-shadow: var(--lift-3); border-right: 1px solid var(--edge-strong);
        }
        .ad-scrim { display: block; position: fixed; inset: 0; z-index: 70; background: rgba(0, 0, 0, 0.55); }
        .ad-publish { position: static; margin-inline: 0; }

        .ad-main { padding-inline: var(--space-4); padding-top: var(--space-4); }
        .ad-line { grid-template-columns: 1fr 56px 84px 32px; }

        /* Stat cards were a horizontal scroller that hid two of the four
           figures with no cue that more existed. A grid shows all four. */
        .ad-main .ad-stats.hscroll {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
          overflow: visible; gap: var(--space-3);
        }
        .ad-main .ad-stats.hscroll .ad-stat { min-width: 0; width: auto; }

        /* Tabs scroll as one strip rather than wrapping a lone "Revenue". */
        .ad-tabs { flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .ad-tabs::-webkit-scrollbar { display: none; }
        .ad-tab { flex: none; }

        /* The invoices table crushed six columns into 375px. Each row is a
           card: number and client on the left, status and amount on the
           right, age and the link button underneath. */
        .ad-table thead { display: none; }
        .ad-table, .ad-table tbody { display: block; }
        .ad-table tr {
          display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-auto-rows: auto;
          gap: var(--space-1) var(--space-3); align-items: center;
          padding: var(--space-3); margin-bottom: var(--space-2);
          border: 1px solid var(--edge); border-radius: var(--radius); background: var(--panel);
        }
        .ad-table td { display: block; padding: 0; border: 0; min-width: 0; }
        .ad-table td:nth-child(1) { grid-column: 1; grid-row: 1; }
        .ad-table td:nth-child(2) { grid-column: 1; grid-row: 2; }
        .ad-table td:nth-child(3) { grid-column: 2; grid-row: 1; justify-self: end; }
        .ad-table td:nth-child(4) { grid-column: 2; grid-row: 2; justify-self: end; }
        .ad-table td:nth-child(5) { grid-column: 1; grid-row: 3; }
        .ad-table td:nth-child(6) { grid-column: 2; grid-row: 3; justify-self: end; }

        /* Bookings has five columns: client and shoot on the left, status
           and date on the right, and the open button is dropped because the
           whole card is already tappable. */
        .ad-table-bookings td:nth-child(3) { grid-column: 2; grid-row: 1; justify-self: end; }
        .ad-table-bookings td:nth-child(4) { grid-column: 2; grid-row: 2; justify-self: end; font-size: 0.78rem; }
        .ad-table-bookings td:nth-child(5) { display: none; }
        .ad-row-unread td:first-child { box-shadow: none; }
        .ad-table-bookings tr.ad-row-unread { border-left: 3px solid var(--primer); }
        .ad-badge-inline { display: none; }
        .ad-pager { flex-wrap: wrap; }
      }

      /* --- skeleton variants (same shimmer as the stat cards) ------------ */
      .ad-skel-line { display: inline-block; height: 0.9em; width: 40%; border-radius: 3px; vertical-align: middle; }
      .ad-skel-block { display: block; height: 2.6rem; width: 100%; border-radius: var(--radius-sm); }
      .ad-skel-rows { display: grid; gap: var(--space-2); }
      .ad-skel-row { display: block; height: 3rem; width: 100%; border-radius: var(--radius); }
      .ad-skel-row-tall { height: 5.5rem; }
    `}</style>
  );
}
