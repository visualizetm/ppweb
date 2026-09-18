import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Grid01 from '@untitled-ui/icons-react/build/esm/Grid01';
import Calendar from '@untitled-ui/icons-react/build/esm/Calendar';
import Users01 from '@untitled-ui/icons-react/build/esm/Users01';
import CreditCard01 from '@untitled-ui/icons-react/build/esm/CreditCard01';
import MessageSquare01 from '@untitled-ui/icons-react/build/esm/MessageSquare01';
import Image03 from '@untitled-ui/icons-react/build/esm/Image03';
import BarChart01 from '@untitled-ui/icons-react/build/esm/BarChart01';
import Settings01 from '@untitled-ui/icons-react/build/esm/Settings01';
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

const NAV_1 = [
  { id: 'dashboard', label: 'Dashboard', icon: Grid01 },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'clients', label: 'Clients', icon: Users01 },
];

const NAV_2 = [
  { id: 'inquiries', label: 'Inquiries', icon: MessageSquare01, badge: true },
  { id: 'invoices', label: 'Invoices', icon: CreditCard01 },
  { id: 'analytics', label: 'Analytics', icon: BarChart01 },
  { id: 'settings', label: 'Settings', icon: Settings01 },
];

/* Everything Michael edits himself. The ids match section ids in
   shared/content-schema.js; NAV_CONTENT is asserted against SECTION_IDS below
   so adding a section without adding it here fails loudly in development. */
const NAV_CONTENT = [
  { id: 'galleries', label: 'Galleries', icon: Image03 },
  { id: 'announcement', label: 'Announcement bar', icon: Announcement01 },
  { id: 'hero', label: 'Hero', icon: Home02 },
  { id: 'home', label: 'Home sections', icon: LayoutAlt01 },
  { id: 'services', label: 'Pricing', icon: Tag01 },
  { id: 'about', label: 'About page', icon: User03 },
  { id: 'testimonials', label: 'Testimonials', icon: Star01 },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'contact', label: 'Contact details', icon: Mail01 },
];

const CONTENT_VIEWS = new Set(NAV_CONTENT.map((n) => n.id));

if (import.meta.env.DEV) {
  const missing = SECTION_IDS.filter((id) => !CONTENT_VIEWS.has(id));
  if (missing.length) {
    console.warn(`[admin] content sections with no nav entry: ${missing.join(', ')}`);
  }
}

const TABS = ['Overview', 'Bookings', 'Clients', 'Revenue'];

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
  const [view, setView] = useState('dashboard');
  const [tab, setTab] = useState('Overview');
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
          {open
            ? open.contact?.name || 'Booking'
            : view === 'publish-history'
              ? 'Publish history'
              : NAV_1.concat(NAV_2, NAV_CONTENT).find((x) => x.id === view)?.label || 'Dashboard'}
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
          {NAV_1.map((n) => (
            <button key={n.id} type="button"
              className={`ad-nav-item ${view === n.id ? 'ad-nav-on' : ''}`}
              onClick={() => go(n.id)}>
              <n.icon width={16} height={16} aria-hidden="true" />
              {n.label}
            </button>
          ))}

          <span className="ad-nav-rule" role="separator" />

          {NAV_2.map((n) => (
            <button key={n.id} type="button"
              className={`ad-nav-item ${view === n.id ? 'ad-nav-on' : ''}`}
              onClick={() => go(n.id)}>
              <n.icon width={16} height={16} aria-hidden="true" />
              {n.label}
              {n.badge && unread > 0 && <span className="ad-count">{unread}</span>}
            </button>
          ))}

          <span className="ad-nav-rule" role="separator" />
          <span className="ad-nav-group">Site content</span>

          {NAV_CONTENT.map((n) => (
            <button key={n.id} type="button"
              className={`ad-nav-item ${view === n.id ? 'ad-nav-on' : ''}`}
              onClick={() => go(n.id)}>
              <n.icon width={16} height={16} aria-hidden="true" />
              {n.label}
              {content.byId.get(n.id)?.changed?.length > 0 && (
                <span className="ad-dot" title="Unpublished changes" aria-label="Unpublished changes" />
              )}
            </button>
          ))}

          <button type="button"
            className={`ad-nav-item ${view === 'publish-history' ? 'ad-nav-on' : ''}`}
            onClick={() => go('publish-history')}>
            <ClockRewind width={16} height={16} aria-hidden="true" />
            Publish history
          </button>

          <span className="ad-nav-rule" role="separator" />
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
              <h1 className="ad-title">{NAV_1.concat(NAV_2).find((n) => n.id === view)?.label || 'Dashboard'}</h1>
              <div className="ad-tabs" role="tablist">
                {TABS.map((t) => (
                  <button key={t} role="tab" aria-selected={tab === t} type="button"
                    className={`ad-tab ${tab === t ? 'ad-tab-on' : ''}`} onClick={() => setTab(t)}>
                    {t}
                  </button>
                ))}
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
                  <h2 className="ad-h2">{query ? `Matching “${query}”` : 'Bookings'}</h2>
                  {unread > 0 && (
                    <button type="button" className="ad-viewall"
                      onClick={async () => { await markAllRead(); refresh(); say('All marked read.'); }}>
                      Mark all read
                    </button>
                  )}
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
                    {bookings.map((b) => (
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
function InvoicesView({ invoices, onSay, loading }) {
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
          {invoices.map((inv) => {
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
    </>
  );
}

/* ==================================================== galleries view ==== */
