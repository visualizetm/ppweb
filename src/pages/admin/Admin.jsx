import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Grid01 from '@untitled-ui/icons-react/build/esm/Grid01';
import Calendar from '@untitled-ui/icons-react/build/esm/Calendar';
import CreditCard01 from '@untitled-ui/icons-react/build/esm/CreditCard01';
import MessageSquare01 from '@untitled-ui/icons-react/build/esm/MessageSquare01';
import Image03 from '@untitled-ui/icons-react/build/esm/Image03';
import SearchLg from '@untitled-ui/icons-react/build/esm/SearchLg';
import Lock01 from '@untitled-ui/icons-react/build/esm/Lock01';
import LogOut01 from '@untitled-ui/icons-react/build/esm/LogOut01';
import Clock from '@untitled-ui/icons-react/build/esm/Clock';
import Plus from '@untitled-ui/icons-react/build/esm/Plus';
import Trash01 from '@untitled-ui/icons-react/build/esm/Trash01';
import Check from '@untitled-ui/icons-react/build/esm/Check';
import XClose from '@untitled-ui/icons-react/build/esm/XClose';
import ArrowLeft from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import AlertCircle from '@untitled-ui/icons-react/build/esm/AlertCircle';
import Loading01 from '@untitled-ui/icons-react/build/esm/Loading01';
import Announcement01 from '@untitled-ui/icons-react/build/esm/Announcement01';
import Home02 from '@untitled-ui/icons-react/build/esm/Home02';
import LayoutAlt01 from '@untitled-ui/icons-react/build/esm/LayoutAlt01';
import Tag01 from '@untitled-ui/icons-react/build/esm/Tag01';
import Mail01 from '@untitled-ui/icons-react/build/esm/Mail01';
import User03 from '@untitled-ui/icons-react/build/esm/User03';
import Star01 from '@untitled-ui/icons-react/build/esm/Star01';
import HelpCircle from '@untitled-ui/icons-react/build/esm/HelpCircle';
import UploadCloud01 from '@untitled-ui/icons-react/build/esm/UploadCloud01';
import ClockRewind from '@untitled-ui/icons-react/build/esm/ClockRewind';
import Menu01 from '@untitled-ui/icons-react/build/esm/Menu01';
import Globe02 from '@untitled-ui/icons-react/build/esm/Globe02';
import Camera01 from '@untitled-ui/icons-react/build/esm/Camera01';
import ChevronDown from '@untitled-ui/icons-react/build/esm/ChevronDown';
import ChevronRight from '@untitled-ui/icons-react/build/esm/ChevronRight';
import ChevronLeft from '@untitled-ui/icons-react/build/esm/ChevronLeft';

import {
  login, logout, getSession, listBookings, updateBooking, markAllRead,
  getDashboardStats, createInvoice, listInvoices,
} from '../../lib/api';
import { invoiceUrl, invoiceState, invoiceStatus, STATUS_LABEL, STATUS_TONE } from '../../lib/invoiceToken';
import { formatMoney, relativeTime, initials, truncate } from '../../lib/format';
import { shootDate, shootTime } from '../../lib/tz';
import { pricing, policy } from '../../data/site';
import AdminStyles from './AdminStyles';
import ContentStyles from './ContentStyles';
import useContentAdmin from './useContentAdmin';
import {
  SectionEditor, GalleriesEditor, PublishDialog, PublishHistoryView, SkeletonRows,
} from './ContentScreens';
import { SECTION_IDS } from '../../../shared/content-schema.js';

/* ===========================================================================
   Admin.
   ---------------------------------------------------------------------------
   Rendered outside the marketing chrome, reskinned into Direction B so it
   belongs to the same studio as the site.

   Payment is now a STEP INSIDE the pipeline rather than its entry point:
     new -> reviewing -> quote sent -> deposit paid -> scheduled -> shot -> delivered
   plus cancelled.
   =========================================================================== */

export const PIPELINE = [
  'new', 'reviewing', 'quote sent', 'deposit paid', 'scheduled', 'shot', 'delivered',
];

/* ===========================================================================
   Navigation.
   ---------------------------------------------------------------------------
   Four standalone screens, then two collapsible groups. The audit before this
   restructure found that Bookings, Clients, Inquiries, Analytics and Settings
   all rendered the Dashboard body with a different heading, and that the
   Dashboard's own Overview / Bookings / Clients / Revenue tab row changed
   nothing on screen. Bookings is now a real screen; the other four and the
   tab row are gone rather than hidden.

   Each item's id doubles as its hash route (#/bookings), so a page can be
   bookmarked and the group that contains it opens on load.
   =========================================================================== */
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: Grid01 },
  { id: 'bookings', label: 'Bookings', icon: Calendar, badge: true },
  { id: 'invoices', label: 'Invoices', icon: CreditCard01 },
  { id: 'publish-history', label: 'Publish history', icon: ClockRewind },
  {
    group: 'website',
    label: 'Website editor',
    icon: Globe02,
    items: [
      { id: 'hero', label: 'Hero', icon: Home02 },
      { id: 'home', label: 'Home sections', icon: LayoutAlt01 },
      { id: 'about', label: 'About', icon: User03 },
      { id: 'testimonials', label: 'Testimonials', icon: Star01 },
      { id: 'faq', label: 'FAQ', icon: HelpCircle },
      { id: 'contact', label: 'Contact', icon: Mail01 },
      { id: 'announcement', label: 'Announcement bar', icon: Announcement01 },
    ],
  },
  {
    group: 'shoots',
    label: 'Photo shoots',
    icon: Camera01,
    items: [
      { id: 'galleries', label: 'Galleries', icon: Image03 },
      { id: 'services', label: 'Pricing', icon: Tag01 },
    ],
  },
];

const ALL_ITEMS = NAV.flatMap((n) => (n.items ? n.items : [n]));
const NAV_CONTENT = ALL_ITEMS.filter((n) => SECTION_IDS.includes(n.id));
const groupOf = (id) => NAV.find((n) => n.items && n.items.some((i) => i.id === id))?.group || null;
const labelOf = (id) => ALL_ITEMS.find((n) => n.id === id)?.label || 'Dashboard';

/* Hash routing. Unknown or retired ids (clients, inquiries, analytics,
   settings) land on the dashboard and the hash is rewritten, so an old
   bookmark redirects cleanly instead of rendering nothing. */
const viewFromHash = () => {
  const id = (window.location.hash || '').replace(/^#\/?/, '');
  return ALL_ITEMS.some((n) => n.id === id) ? id : 'dashboard';
};

const CONTENT_VIEWS = new Set(NAV_CONTENT.map((n) => n.id));

const PAGE_SIZE = 20;

if (import.meta.env.DEV) {
  const missing = SECTION_IDS.filter((id) => !CONTENT_VIEWS.has(id));
  if (missing.length) {
    console.warn(`[admin] content sections with no nav entry: ${missing.join(', ')}`);
  }
}


/* ============================================================== login === */
function Login({ onIn, notice }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await login(password);
    setBusy(false);
    if (res.ok) onIn();
    /* api.js always supplies a message now: the server's own words for a
       wrong password, or the status and content type for anything else. The
       fallback here is only reachable if that contract is broken. */
    else setError(res.message || 'Sign-in failed, and the server gave no reason.');
  };

  return (
    <div className="ad-login">
      <form className="ad-login-box plate" onSubmit={submit}>
        <span className="ad-login-icon" aria-hidden="true"><Lock01 width={20} height={20} /></span>
        <h1 className="ad-login-title">Paps Productions</h1>
        <p className="ad-login-sub">Dashboard</p>

        <label className="ad-field">
          <span className="ad-label">Password</span>
          <input
            className="field-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </label>

        {/* A failed session check on page load is shown before a password is
            even typed. It is the routing or server failure that would
            otherwise be misread as "wrong password" a moment later. */}
        {notice && !error && <p className="ad-login-err" role="alert">{notice}</p>}
        {error && <p className="ad-login-err" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Checking' : 'Sign in'}
        </button>

      </form>
    </div>
  );
}

/* ========================================================== avatar ======= */
function Avatar({ name, size = 28 }) {
  return (
    <span className="ad-avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials(name)}
    </span>
  );
}

/* ========================================================= sparkline ===== */
function Bars({ series = [] }) {
  const max = Math.max(1, ...series.map((s) => s.count));
  return (
    <span className="ad-bars" aria-hidden="true">
      {series.map((s, i) => (
        <span key={i} className="ad-bar" style={{ height: `${Math.max(8, (s.count / max) * 100)}%` }} />
      ))}
    </span>
  );
}

function Curve({ series = [] }) {
  const max = Math.max(1, ...series.map((s) => s.count));
  const pts = series
    .map((s, i) => `${(i / Math.max(1, series.length - 1)) * 100},${34 - (s.count / max) * 30}`)
    .join(' ');
  return (
    <svg className="ad-curve" viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ============================================================== main ===== */
export default function Admin() {
  const [authed, setAuthed] = useState(null);
  const [view, setView] = useState(viewFromHash);
  /* Which groups are open. The group holding the active page is always
     opened, so you never have to hunt for the page you are already on. */
  const [openGroups, setOpenGroups] = useState(() => new Set([groupOf(viewFromHash())].filter(Boolean)));
  const [query, setQuery] = useState('');
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishOpen, setPublishOpen] = useState(false);
  /* Mobile only: the sidebar becomes a drawer behind a Menu button. */
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionNotice, setSessionNotice] = useState(null);
  const [loadErrors, setLoadErrors] = useState([]);
  const searchRef = useRef(null);

  const content = useContentAdmin(authed);

  useEffect(() => {
    const wanted = `#/${view}`;
    if (window.location.hash !== wanted) window.history.replaceState(null, '', wanted);
    const g = groupOf(view);
    if (g) setOpenGroups((prev) => (prev.has(g) ? prev : new Set([...prev, g])));
  }, [view]);

  useEffect(() => {
    /* Back/forward or a typed hash. An unknown id lands on the dashboard and
       the hash is corrected even when the dashboard was already showing. A
       hash change also closes an open booking, since the URL now names a page. */
    const onHash = () => {
      const next = viewFromHash();
      if (window.location.hash !== `#/${next}`) window.history.replaceState(null, '', `#/${next}`);
      setView(next);
      setOpenId(null);
      setMenuOpen(false);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const toggleGroup = (g) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });

  useEffect(() => {
    getSession().then((r) => {
      setAuthed(Boolean(r.ok && r.session?.authed));
      /* A 401 here just means "not signed in", which is the normal state of a
         fresh login page. Anything that is not a JSON answer from the API is a
         real problem and is worth showing before a password is typed. */
      setSessionNotice(
        !r.ok && (r.kind === 'not-json' || r.kind === 'network')
          ? `Could not check your session. ${r.message}`
          : null
      );
    });
  }, []);

  const refresh = useCallback(async () => {
    const [b, s, i] = await Promise.all([listBookings({ search: query }), getDashboardStats(), listInvoices()]);
    if (b.ok) setBookings(b.items);
    if (s.ok) setStats(s.stats);
    if (i.ok) setInvoices(i.items);
    /* A failed load used to leave an empty dashboard with no explanation.
       Each failure is listed with the endpoint and what came back. */
    setLoadErrors(
      [
        !b.ok && `Bookings did not load. ${b.message}`,
        !s.ok && `Dashboard figures did not load. ${s.message}`,
        !i.ok && `Invoices did not load. ${i.message}`,
      ].filter(Boolean)
    );
    setLoading(false);
  }, [query]);

  useEffect(() => {
    if (authed) refresh();
  }, [authed, refresh]);

  /* Invoices are mirrored to localStorage so a payment made in another tab
     shows up here. This is what makes the two-role demo land. */
  useEffect(() => invoiceState.subscribe(() => refresh()), [refresh]);

  const unread = bookings.filter((b) => !b.read).length;

  useEffect(() => {
    document.title = unread
      ? `(${unread}) Dashboard — Paps Productions`
      : 'Dashboard — Paps Productions';
    return () => { document.title = 'Paps Productions'; };
  }, [unread]);

  /* Cmd/Ctrl-F focuses search, matching the affordance shown in the sidebar. */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') { setOpenId(null); setMenuOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* Every sidebar navigation goes through here. On a phone the sidebar is a
     drawer, so it closes, and the page scrolls to the top so the screen you
     just chose is the first thing visible rather than a full scroll away. */
  const go = (id) => {
    setView(id);
    setOpenId(null);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  const say = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  if (authed === null) return <div className="ad-boot" />;
  if (!authed) return (<><Login onIn={() => setAuthed(true)} notice={sessionNotice} /><AdminStyles /></>);

  const open = bookings.find((b) => b.id === openId);

  const patch = async (id, changes, message) => {
    /* Optimistic: the row updates immediately, then reconciles against what
       the data layer actually returns. */
    setBookings((list) => list.map((b) => (b.id === id ? { ...b, ...changes } : b)));
    const res = await updateBooking(id, changes);
    if (res.ok) {
      setBookings((list) => list.map((b) => (b.id === id ? res.booking : b)));
      if (message) say(message);
    } else {
      refresh();
      say(`That did not save. ${res.message}`);
    }
  };

  const revertSection = async (sectionId) => {
    const res = await content.revert(sectionId);
    say(res?.ok ? 'Draft discarded. This section matches the live site again.' : `Could not discard that draft. ${res?.message || ''}`.trim());
  };

  const openBooking = (b) => {
    setOpenId(b.id);
    if (!b.read) patch(b.id, { read: true });
  };

  return (
    <div className="ad">
      {/* --------------------------------------------- mobile top bar --- */}
      {/* Only rendered at phone widths (CSS). Everything a phone needs at
          arm's reach: where you are, the menu, and publish. */}
      <header className="ad-topbar">
        <button
          type="button"
          className="ad-topbar-menu"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="ad-drawer"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <XClose width={18} height={18} aria-hidden="true" /> : <Menu01 width={18} height={18} aria-hidden="true" />}
        </button>
        <span className="ad-topbar-title">
          {open ? open.contact?.name || 'Booking' : labelOf(view)}
        </span>
        <button
          type="button"
          className={`cf-btn cf-btn-primary ad-topbar-publish ${content.pendingCount ? '' : 'cf-publish-idle'}`}
          onClick={() => setPublishOpen(true)}
          disabled={!content.pendingCount}
          aria-label={content.pendingCount ? `Publish ${content.pendingCount} changes` : 'Nothing to publish'}
        >
          <UploadCloud01 width={15} height={15} aria-hidden="true" />
          {content.pendingCount ? content.pendingCount : ''}
        </button>
      </header>

      {menuOpen && <div className="ad-scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />}

      {/* --------------------------------------------------- sidebar --- */}
      <aside id="ad-drawer" className={`ad-side ${menuOpen ? 'ad-side-open' : ''}`}>
        <div className="ad-side-top">
          <span className="ad-mark" aria-hidden="true" />
          <span className="ad-side-name">Paps</span>
        </div>

        <div className="ad-search">
          <SearchLg width={15} height={15} aria-hidden="true" />
          <input
            ref={searchRef}
            className="ad-search-input"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search bookings"
          />
          <span className="ad-keys" aria-hidden="true"><kbd>⌘</kbd><kbd>F</kbd></span>
        </div>

        <nav className="ad-nav" aria-label="Sections">
          {NAV.map((n) =>
            n.items ? (
              <div key={n.group} className={`ad-group ${openGroups.has(n.group) ? 'ad-group-open' : ''}`}>
                <button
                  type="button"
                  className={`ad-nav-item ad-group-toggle ${n.items.some((i) => i.id === view) ? 'ad-group-active' : ''}`}
                  onClick={() => toggleGroup(n.group)}
                  aria-expanded={openGroups.has(n.group)}
                  aria-controls={`ad-group-${n.group}`}
                >
                  <n.icon width={16} height={16} aria-hidden="true" />
                  {n.label}
                  {n.items.some((i) => content.byId.get(i.id)?.changed?.length > 0) && !openGroups.has(n.group) && (
                    <span className="ad-dot" title="Unpublished changes" aria-label="Unpublished changes" />
                  )}
                  <span className="ad-group-chev" aria-hidden="true">
                    {openGroups.has(n.group) ? <ChevronDown width={14} height={14} /> : <ChevronRight width={14} height={14} />}
                  </span>
                </button>
                <div id={`ad-group-${n.group}`} className="ad-group-items" hidden={!openGroups.has(n.group)}>
                  {n.items.map((i) => (
                    <button key={i.id} type="button"
                      className={`ad-nav-item ad-nav-sub ${view === i.id ? 'ad-nav-on' : ''}`}
                      onClick={() => go(i.id)}>
                      <i.icon width={15} height={15} aria-hidden="true" />
                      {i.label}
                      {content.byId.get(i.id)?.changed?.length > 0 && (
                        <span className="ad-dot" title="Unpublished changes" aria-label="Unpublished changes" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button key={n.id} type="button"
                className={`ad-nav-item ${view === n.id ? 'ad-nav-on' : ''}`}
                onClick={() => go(n.id)}>
                <n.icon width={16} height={16} aria-hidden="true" />
                {n.label}
                {n.badge && unread > 0 && <span className="ad-count">{unread}</span>}
              </button>
            )
          )}
        </nav>


        <div className="ad-week">
          <div className="ad-week-head">
            <span className="ad-label">Upcoming shoots</span>
            <span className="ad-plus" aria-hidden="true"><Plus width={13} height={13} /></span>
          </div>
          {(stats?.upcoming || []).slice(0, 4).map((b) => (
            <button key={b.id} type="button" className="ad-week-row" onClick={() => openBooking(b)}>
              <Avatar name={b.contact.name} size={24} />
              <span className="ad-week-name">{b.contact.name}</span>
              <span className="ad-week-mini" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ height: `${6 + ((PIPELINE.indexOf(b.status) + 1) / PIPELINE.length) * (i + 1) * 4}px` }} />
                ))}
              </span>
            </button>
          ))}
          {!stats?.upcoming?.length && <p className="ad-empty-mini">Nothing booked yet.</p>}
        </div>

        {/* The one control that changes the public site. It is deliberately
            the most prominent thing in the sidebar and deliberately the only
            way anything reaches a visitor. */}
        <div className="ad-publish">
          <button
            type="button"
            className={`cf-btn cf-btn-primary cf-publish-btn ${content.pendingCount ? '' : 'cf-publish-idle'}`}
            onClick={() => setPublishOpen(true)}
            disabled={!content.pendingCount}
          >
            <UploadCloud01 width={15} height={15} aria-hidden="true" />
            {content.pendingCount
              ? `Publish ${content.pendingCount} ${content.pendingCount === 1 ? 'change' : 'changes'}`
              : 'Nothing to publish'}
          </button>
          <p className="ad-publish-note">
            {content.pendingCount
              ? 'Your edits are saved as drafts. The site does not change until you publish.'
              : 'The live site matches your drafts.'}
          </p>
        </div>

        <div className="ad-side-foot">
          <button type="button" className="ad-reset" onClick={async () => { await logout(); setAuthed(false); }}>
            <LogOut01 width={13} height={13} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------- main --- */}
      <main className="ad-main">
        {(loadErrors.length > 0 || content.error) && (
          <div className="ad-alert" role="alert">
            {content.error && <p>Site content did not load. {content.error}</p>}
            {loadErrors.map((m) => (
              <p key={m}>{m}</p>
            ))}
          </div>
        )}

        {open ? (
          <BookingDetail booking={open} onBack={() => setOpenId(null)} onPatch={patch} onSay={say} onRefresh={refresh} />
        ) : view === 'bookings' ? (
          <BookingsView bookings={bookings} loading={loading} query={query} unread={unread}
            onOpen={openBooking}
            onMarkAll={async () => { await markAllRead(); refresh(); say('All marked read.'); }} />
        ) : view === 'invoices' ? (
          <InvoicesView invoices={invoices} onSay={say} loading={loading} />
        ) : view === 'publish-history' ? (
          <PublishHistoryView history={content.history} loading={content.loading} />
        ) : view === 'galleries' ? (
          <GalleriesEditor
            row={content.byId.get('galleries')}
            saving={content.saving}
            saveError={content.saveErrors.galleries}
            reverting={content.reverting}
            onChange={(next) => content.setDraft('galleries', next)}
            onRevert={revertSection}
            onSay={say}
          />
        ) : CONTENT_VIEWS.has(view) ? (
          <SectionEditor
            sectionId={view}
            row={content.byId.get(view)}
            saving={content.saving}
            saveError={content.saveErrors[view]}
            reverting={content.reverting}
            onChange={(next) => content.setDraft(view, next)}
            onRevert={revertSection}
          />
        ) : (
          <>
            <header className="ad-head">
              <div>
                <h1 className="ad-title">Dashboard</h1>
                <p className="cf-blurb">Today across bookings, invoices and the site.</p>
              </div>
            </header>

            <div className="hscroll-wrap ad-stats-wrap">
              <div className="ad-stats hscroll">
                <StatCard label="Shoots completed" value={stats?.completed.value ?? 0}
                  delta={stats?.completed.delta} viz={<Bars series={stats?.completed.series || []} />} loading={loading} />
                <StatCard label="Awaiting quote" value={bookings.filter((b) => b.status === 'new' || b.status === 'reviewing').length}
                  viz={<Curve series={stats?.conversion.series || []} />} loading={loading} />
                <StatCard label="Unpaid invoices"
                  value={formatMoney(invoices.filter((i) => invoiceStatus(i, i.state) !== 'paid' && invoiceStatus(i, i.state) !== 'cancelled')
                    .reduce((s, i) => s + i.amountDueCents, 0))}
                  sub={`${invoices.filter((i) => invoiceStatus(i, i.state) === 'overdue').length} overdue`} loading={loading} />
                <StatCard label="Revenue this month" value={formatMoney(stats?.revenue.value ?? 0)}
                  delta={stats?.revenue.delta} viz={<Bars series={stats?.revenue.series || []} />} loading={loading} />
                <StatCard label="Awaiting deposit" value={stats?.awaitingDeposit.value ?? 0}
                  people={stats?.awaitingDeposit.people} loading={loading} />
              </div>
            </div>

            <div className="ad-cols">
              <section className="ad-feed-col">
                <div className="ad-section-head">
                  <h2 className="ad-h2">{query ? `Matching “${query}”` : 'Recent bookings'}</h2>
                  <button type="button" className="ad-viewall" onClick={() => go('bookings')}>
                    View all{bookings.length > 6 ? ` (${bookings.length})` : ''}
                  </button>
                </div>

                {loading ? (
                  <div className="ad-skeletons">{[0, 1, 2].map((i) => <span key={i} className="ad-skel" />)}</div>
                ) : bookings.length === 0 ? (
                  <div className="ad-empty">
                    <h3>Nothing here yet</h3>
                    <p>
                      {query
                        ? 'No booking matches that search. Try a name, a car, or a reference like PP-2418.'
                        : 'When someone sends a booking it lands here first. Open it, build a quote, and send them an invoice link.'}
                    </p>
                  </div>
                ) : (
                  <ul className="ad-feed">
                    {bookings.slice(0, 6).map((b) => (
                      <li key={b.id}>
                        <button type="button" className={`ad-card ${!b.read ? 'ad-card-unread' : ''}`} onClick={() => openBooking(b)}>
                          <span className="ad-card-top">
                            <span className="ad-when">
                              <Clock width={12} height={12} aria-hidden="true" />
                              {b.scheduledAt ? relativeTime(b.scheduledAt) : relativeTime(b.createdAt)}
                            </span>
                            <span className="ad-card-meta">
                              {b.messageCount > 0 && (<span><MessageSquare01 width={12} height={12} aria-hidden="true" />{b.messageCount}</span>)}
                              {(b.invoices?.length > 0) && (<span><CreditCard01 width={12} height={12} aria-hidden="true" />{b.invoices.length}</span>)}
                            </span>
                          </span>
                          <span className="ad-card-title">{b.title}</span>
                          <span className="ad-card-foot">
                            <span className="ad-tags">
                              <span className={`badge ${statusTone(b.status)}`}>{b.status}</span>
                              {b.packageSlug && <span className="badge">{b.packageSlug}</span>}
                            </span>
                            <Avatar name={b.contact.name} size={24} />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <aside className="ad-rail">
                <div className="ad-rail-card">
                  <span className="ad-label">This week</span>
                  <p className="ad-rail-big">
                    {stats?.weekCapacity.booked ?? 0}<span> / {stats?.weekCapacity.capacity ?? 0}</span>
                  </p>
                  <p className="ad-rail-sub">{stats?.weekCapacity.open ?? 0} slots still open</p>
                  {(stats?.weekCapacity.items || []).slice(0, 3).map((b) => (
                    <div key={b.id} className="ad-rail-row">
                      <Avatar name={b.contact.name} size={22} />
                      <span>{b.contact.name}</span>
                      <span className="ad-dot" aria-hidden="true" />
                    </div>
                  ))}
                </div>

                <div className="ad-rail-card">
                  <span className="ad-label">Recent inquiries</span>
                  {(stats?.inquiries || []).slice(0, 4).map((m) => (
                    <div key={m.id} className="ad-rail-msg">
                      <Avatar name={m.name} size={22} />
                      <span>
                        <strong>{m.name}</strong>
                        <span className="ad-rail-preview">{truncate(m.message, 62)}</span>
                      </span>
                    </div>
                  ))}
                  {!stats?.inquiries?.length && <p className="ad-empty-mini">No messages yet.</p>}
                </div>
              </aside>
            </div>
          </>
        )}
      </main>

      {publishOpen && (
        <PublishDialog
          pending={content.pending}
          onCancel={() => setPublishOpen(false)}
          onConfirm={async (sectionIds) => {
            const res = await content.publish(sectionIds);
            setPublishOpen(false);
            say(
              res.ok
                ? `Published. ${sectionIds.length} ${sectionIds.length === 1 ? 'section is' : 'sections are'} now live.`
                : `That publish did not go through. ${res.message}`
            );
          }}
        />
      )}

      {toast && <div className="ad-toast" role="status">{toast}</div>}
      <AdminStyles />
      <ContentStyles />
    </div>
  );
}

function statusTone(status) {
  if (status === 'delivered' || status === 'deposit paid') return 'badge-ok';
  if (status === 'new') return 'badge-info';
  if (status === 'cancelled') return 'badge-alert';
  if (status === 'quote sent' || status === 'reviewing') return 'badge-warn';
  return '';
}

function StatCard({ label, value, sub, delta, viz, people, loading }) {
  return (
    <div className="ad-stat">
      <span className="ad-label">{label}</span>
      {loading ? <span className="ad-skel ad-skel-num" /> : <span className="ad-stat-num data">{value}</span>}
      <span className="ad-stat-foot">
        {typeof delta === 'number' && (
          <span className={`badge ${delta >= 0 ? 'badge-ok' : 'badge-alert'}`}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
        {sub && <span className="ad-stat-sub">{sub}</span>}
        {people && (
          <span className="ad-stack">
            {people.slice(0, 3).map((n) => <Avatar key={n} name={n} size={22} />)}
            {people.length > 3 && <span className="ad-more">+{people.length - 3}</span>}
          </span>
        )}
        {viz}
      </span>
    </div>
  );
}

/* ================================================== booking detail ====== */
function BookingDetail({ booking, onBack, onPatch, onSay, onRefresh }) {
  const [lines, setLines] = useState(() => suggestLines(booking));
  const [kind, setKind] = useState('deposit');
  const [dueDays, setDueDays] = useState(7);
  const [notes, setNotes] = useState(booking.notes || '');
  const [made, setMade] = useState(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const total = lines.reduce((s, l) => s + (Number(l.amountCents) || 0) * (Number(l.quantity) || 1), 0);
  const due = kind === 'deposit' ? Math.min(pricing.depositCents, total) : total;

  const setLine = (i, key, value) =>
    setLines((ls) => ls.map((l, n) => (n === i ? { ...l, [key]: value } : l)));

  const request = async () => {
    setBusy(true);
    const dueDate = new Date(Date.now() + dueDays * 86400000).toISOString();
    const res = await createInvoice({ bookingId: booking.id, lines, kind, dueDate, title: booking.title });
    setBusy(false);
    if (!res.ok) return onSay(`Could not create that invoice. ${res.message}`);
    setMade({ ...res.invoice, amountDueCents: due });
    onSay(`${res.invoice.number} created. Copy the link and send it.`);
    onRefresh();
  };

  const link = made ? invoiceUrl({ ...made, amountDueCents: due }) : '';

  const copy = async (text, what) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    setCopied(what);
    setTimeout(() => setCopied(false), 2400);
  };

  const smsText = made
    ? `Hey ${booking.contact.name.split(' ')[0]} — invoice for the ${booking.title} shoot is here: ${link}\n\n${formatMoney(due)} to hold the date. Any questions just reply here.`
    : '';
  const emailText = made
    ? `Hi ${booking.contact.name.split(' ')[0]},\n\nThanks for booking — here's the invoice for the ${booking.title} shoot:\n${link}\n\n${formatMoney(due)} is due to hold the date. ${policy.short}\n\nAny questions, just reply to this.\n\nMichael\nPaps Productions`
    : '';

  return (
    <div className="ad-detail">
      <button type="button" className="ad-back" onClick={onBack}>
        <ArrowLeft width={15} height={15} aria-hidden="true" /> All bookings
      </button>

      <header className="ad-detail-head">
        <div>
          <span className="data ad-ref">{booking.ref}</span>
          <h1 className="ad-title">{booking.title}</h1>
          <p className="ad-detail-sub">
            {booking.contact.name} · {booking.contact.email}
            {booking.contact.phone ? ` · ${booking.contact.phone}` : ''}
          </p>
        </div>
      </header>

      <div className="ad-pipeline" role="group" aria-label="Booking status">
        {PIPELINE.map((s) => {
          const at = PIPELINE.indexOf(booking.status);
          const i = PIPELINE.indexOf(s);
          return (
            <button key={s} type="button"
              className={`ad-pip ${i <= at ? 'ad-pip-done' : ''} ${s === booking.status ? 'ad-pip-now' : ''}`}
              onClick={() => onPatch(booking.id, { status: s }, `Moved to ${s}.`)}>
              {i < at && <Check width={11} height={11} aria-hidden="true" />}
              {s}
            </button>
          );
        })}
        <button type="button" className="ad-pip ad-pip-cancel"
          onClick={() => onPatch(booking.id, { status: 'cancelled' }, 'Marked cancelled.')}>
          cancelled
        </button>
      </div>

      <div className="ad-detail-grid">
        <section className="ad-panel">
          <h2 className="ad-h2">The booking</h2>
          <dl className="ad-facts">
            <div><dt>Shoot</dt><dd>{booking.packageSlug || '—'}{booking.tierName ? ` · ${booking.tierName}` : ''}</dd></div>
            <div><dt>Vehicle</dt><dd>{booking.vehicle ? `${booking.vehicle.year || ''} ${booking.vehicle.make} ${booking.vehicle.model}`.trim() : '—'}</dd></div>
            <div><dt>Colour</dt><dd>{booking.vehicle?.color || '—'}</dd></div>
            <div><dt>Cars / people</dt><dd>{booking.vehicleCount} / {booking.peopleCount}</dd></div>
            <div><dt>Where</dt><dd>{booking.locationPref || 'Open'}</dd></div>
            <div><dt>When</dt><dd>{booking.scheduledAt ? `${shootDate(booking.scheduledAt)} · ${shootTime(booking.scheduledAt)}` : booking.flexible ? 'Flexible' : 'Not set'}</dd></div>
          </dl>
          {booking.shotNotes && (<><h3 className="ad-h3">In their words</h3><p className="ad-quote">{booking.shotNotes}</p></>)}
        </section>

        <section className="ad-panel">
          <h2 className="ad-h2">Private notes</h2>
          <textarea className="field-textarea" value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Only you see this." />
          <button type="button" className="btn btn-secondary btn-sm"
            onClick={() => onPatch(booking.id, { notes }, 'Notes saved.')}>Save notes</button>
        </section>
      </div>

      {/* ------------------------------------------------ quote builder --- */}
      <section className="ad-panel">
        <h2 className="ad-h2">Build the quote</h2>
        <p className="ad-panel-sub">Edit anything. The total updates as you type.</p>

        <div className="ad-lines">
          {lines.map((l, i) => (
            <div className="ad-line" key={i}>
              <input className="field-input" value={l.description} aria-label="Description"
                onChange={(e) => setLine(i, 'description', e.target.value)} />
              <input className="field-input data ad-line-qty" type="number" min="1" value={l.quantity} aria-label="Quantity"
                onChange={(e) => setLine(i, 'quantity', Number(e.target.value))} />
              <input className="field-input data ad-line-amt" type="number" step="1" aria-label="Amount in dollars"
                value={(l.amountCents / 100).toString()}
                onChange={(e) => setLine(i, 'amountCents', Math.round(Number(e.target.value) * 100))} />
              <button type="button" className="ad-line-del" aria-label="Remove line"
                onClick={() => setLines((ls) => ls.filter((_, n) => n !== i))}>
                <Trash01 width={14} height={14} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="ad-addline"
          onClick={() => setLines((ls) => [...ls, { description: '', quantity: 1, amountCents: 0 }])}>
          <Plus width={14} height={14} aria-hidden="true" /> Add a line
        </button>

        <div className="ad-quote-foot">
          <label className="ad-inline">
            <span className="ad-label">Asking for</span>
            <select className="field-select" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="deposit">Deposit only</option>
              <option value="full">Full amount</option>
              <option value="balance">Balance</option>
            </select>
          </label>
          <label className="ad-inline">
            <span className="ad-label">Due in</span>
            <select className="field-select" value={dueDays} onChange={(e) => setDueDays(Number(e.target.value))}>
              <option value={3}>3 days</option><option value={7}>7 days</option><option value={14}>14 days</option>
            </select>
          </label>
          <span className="ad-quote-total">
            <span className="ad-label">Total {formatMoney(total)} · due now</span>
            <span className="data">{formatMoney(due)}</span>
          </span>
          <button type="button" className="btn btn-primary" onClick={request} disabled={busy || !lines.length}>
            {busy ? <><Loading01 className="bk-spin" width={15} height={15} aria-hidden="true" />Creating</> : 'Request payment'}
          </button>
        </div>
      </section>

      {/* ------------------------------------------------- copy the link -- */}
      {made && (
        <section className="ad-panel ad-sendpanel">
          <h2 className="ad-h2">Send it yourself</h2>
          <p className="ad-panel-sub">
            Nothing is emailed automatically. Copy the link and send it however you normally talk
            to this client.
          </p>

          <div className="ad-linkrow">
            <input className="field-input data" readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Invoice link" />
            <button type="button" className={`btn ${copied === 'link' ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => copy(link, 'link')}>
              {copied === 'link' ? <><Check width={15} height={15} aria-hidden="true" />Copied</> : 'Copy link'}
            </button>
          </div>

          <div className="ad-msgs">
            <div>
              <span className="ad-label">Text message</span>
              <pre className="ad-msg">{smsText}</pre>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => copy(smsText, 'sms')}>
                {copied === 'sms' ? 'Copied' : 'Copy text'}
              </button>
            </div>
            <div>
              <span className="ad-label">Email</span>
              <pre className="ad-msg">{emailText}</pre>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => copy(emailText, 'email')}>
                {copied === 'email' ? 'Copied' : 'Copy email'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------ invoice history - */}
      {booking.invoices?.length > 0 && (
        <section className="ad-panel">
          <h2 className="ad-h2">Invoices</h2>
          <ul className="ad-invlist">
            {booking.invoices.map((inv) => {
              const st = invoiceStatus(inv, invoiceState.get(inv.id));
              const s = invoiceState.get(inv.id);
              return (
                <li key={inv.id}>
                  <span className="data">{inv.number}</span>
                  <span className={`badge ${STATUS_TONE[st]}`}>{STATUS_LABEL[st]}</span>
                  <span className="data">{formatMoney(inv.totalCents)}</span>
                  <span className="ad-inv-when">
                    {s?.paidAt ? `Paid ${relativeTime(s.paidAt)}`
                      : s?.viewedAt ? `Opened ${relativeTime(s.viewedAt)}`
                      : `Sent ${relativeTime(inv.issuedAt)}`}
                  </span>
                  <button type="button" className="ad-viewall"
                    onClick={() => copy(invoiceUrl(inv), 'link')}>Copy link</button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function suggestLines(booking) {
  const out = [{ description: `${booking.title} — session fee`, quantity: 1, amountCents: 27500 }];
  if (booking.vehicleCount > 1) {
    out.push({ description: 'Additional vehicle', quantity: booking.vehicleCount - 1, amountCents: 12500 });
  }
  return out;
}

/* ==================================================== invoices view ===== */
/* ======================================================== bookings ======= */

/* Status tabs, mapped to the real pipeline. "All" first, like the reference. */
const BOOKING_TABS = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'new', label: 'New', match: (s) => s === 'new' },
  { id: 'quoted', label: 'Quoted', match: (s) => s === 'reviewing' || s === 'quote sent' },
  { id: 'booked', label: 'Booked', match: (s) => s === 'deposit paid' || s === 'scheduled' },
  { id: 'done', label: 'Done', match: (s) => s === 'shot' || s === 'delivered' },
  { id: 'cancelled', label: 'Cancelled', match: (s) => s === 'cancelled' },
];

function Pager({ page, pages, onPage, total, from, to }) {
  if (pages <= 1) return null;
  return (
    <div className="ad-pager">
      <span className="ad-pager-range">{from}–{to} of {total}</span>
      <span className="ad-pager-btns">
        <button type="button" className="cf-icon-btn" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft width={15} height={15} aria-hidden="true" />
        </button>
        <span className="ad-pager-page data">{page} / {pages}</span>
        <button type="button" className="cf-icon-btn" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Next page">
          <ChevronRight width={15} height={15} aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}

function BookingsView({ bookings, loading, query, unread, onOpen, onMarkAll }) {
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);

  const current = BOOKING_TABS.find((t) => t.id === tab) || BOOKING_TABS[0];
  const filtered = bookings.filter((b) => current.match(b.status));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pick = (id) => { setTab(id); setPage(1); };

  return (
    <>
      <header className="ad-head ad-head-row">
        <div>
          <h1 className="ad-title">Bookings</h1>
          <p className="cf-blurb">{query ? `Matching “${query}”` : 'Every request, newest first. Open one to quote it or move it along.'}</p>
        </div>
        {unread > 0 && (
          <button type="button" className="ad-viewall" onClick={onMarkAll}>Mark all read</button>
        )}
      </header>

      <div className="ad-tabs" role="tablist" aria-label="Filter bookings by status">
        {BOOKING_TABS.map((t) => {
          const n = bookings.filter((b) => t.match(b.status)).length;
          return (
            <button key={t.id} role="tab" type="button" aria-selected={tab === t.id}
              className={`ad-tab ${tab === t.id ? 'ad-tab-on' : ''}`} onClick={() => pick(t.id)}>
              {t.label}<span className="ad-tab-n">{n}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <SkeletonRows count={5} />
      ) : !rows.length ? (
        <div className="ad-empty ad-empty-page">
          <h3>{tab === 'all' ? 'No bookings yet' : `Nothing ${current.label.toLowerCase()}`}</h3>
          <p>{tab === 'all' ? 'When someone sends a booking it lands here first.' : 'Try another tab.'}</p>
        </div>
      ) : (
        <>
          <table className="ad-table ad-table-bookings">
            <thead>
              <tr><th>Client</th><th>Shoot</th><th>Status</th><th>When</th><th className="ad-r" /></tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className={!b.read ? 'ad-row-unread' : ''} onClick={() => onOpen(b)}>
                  <td>
                    <span className="ad-who">
                      <Avatar name={b.contact.name} size={26} />
                      <span>
                        <span className="ad-who-name">{b.contact.name}</span>
                        <span className="ad-who-sub data">{b.ref}</span>
                      </span>
                    </span>
                  </td>
                  <td>
                    <span className="ad-who-name">{b.title}</span>
                    {b.packageSlug && <span className="badge ad-badge-inline">{b.packageSlug}</span>}
                  </td>
                  <td><span className={`badge ${statusTone(b.status)}`}>{b.status}</span></td>
                  <td className="ad-muted">{b.scheduledAt ? shootDate(b.scheduledAt) : relativeTime(b.createdAt)}</td>
                  <td className="ad-r">
                    <button type="button" className="cf-icon-btn" aria-label={`Open ${b.contact.name}`} onClick={(e) => { e.stopPropagation(); onOpen(b); }}>
                      <ChevronRight width={16} height={16} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pager page={safePage} pages={pages} onPage={setPage} total={filtered.length}
            from={(safePage - 1) * PAGE_SIZE + 1} to={Math.min(safePage * PAGE_SIZE, filtered.length)} />
        </>
      )}
    </>
  );
}

function InvoicesView({ invoices, onSay, loading }) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(invoices.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const rows = invoices.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* Skeleton while the first load is in flight, so the "No invoices yet"
     empty state never flashes before the real list arrives. */
  if (loading) {
    return (
      <>
        <header className="ad-head"><h1 className="ad-title">Invoices</h1></header>
        <SkeletonRows count={4} />
      </>
    );
  }
  if (!invoices.length) {
    return (
      <div className="ad-empty ad-empty-page">
        <h3>No invoices yet</h3>
        <p>Open a booking, build a quote, and hit “Request payment”. The invoice will show up here with its status.</p>
      </div>
    );
  }
  return (
    <>
      <header className="ad-head"><h1 className="ad-title">Invoices</h1></header>
      <table className="ad-table">
        <thead>
          <tr><th>Number</th><th>Client</th><th>Status</th><th className="ad-r">Amount</th><th>Age</th><th /></tr>
        </thead>
        <tbody>
          {rows.map((inv) => {
            const st = invoiceStatus(inv, inv.state);
            return (
              <tr key={inv.id}>
                <td className="data">{inv.number}</td>
                <td>{inv.customerName}</td>
                <td><span className={`badge ${STATUS_TONE[st]}`}>{STATUS_LABEL[st]}</span></td>
                <td className="ad-r data">{formatMoney(inv.totalCents)}</td>
                <td className="ad-muted">{relativeTime(inv.issuedAt)}</td>
                <td className="ad-r">
                  <button type="button" className="ad-viewall" onClick={async () => {
                    await navigator.clipboard?.writeText(invoiceUrl(inv)).catch(() => {});
                    onSay('Link copied.');
                  }}>Copy link</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pager page={safePage} pages={pages} onPage={setPage} total={invoices.length}
        from={(safePage - 1) * PAGE_SIZE + 1} to={Math.min(safePage * PAGE_SIZE, invoices.length)} />
    </>
  );
}

/* ==================================================== galleries view ==== */
