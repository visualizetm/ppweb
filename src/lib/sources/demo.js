/* ===========================================================================
   Demo data source.
   ---------------------------------------------------------------------------
   Implements exactly the same function surface as ./live.js, against seeded
   in-memory data mirrored to sessionStorage. Nothing here talks to a network.

   Because the two modules export identical signatures, promoting the demo to
   production is a one-line env change in .env.production — not a refactor.
   Do not add a function here without adding it to live.js too.
   =========================================================================== */

import { buildSeed, buildInquiryFeed } from '../demoSeed';
import { pricing } from '../../data/site';
import { invoiceState } from '../invoiceToken';

const STORAGE_KEY = 'pp_demo_state_v1';
const SESSION_KEY = 'pp_demo_session_v1';

/* Artificial latency. Without it every action resolves instantly, loading
   states never render, and the demo feels less real than the finished product
   rather than more. */
const LATENCY = { read: 220, write: 700, payment: 1200 };

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------- storage ---- */
/* sessionStorage, never localStorage: a refresh keeps their place mid-tour, a
   new tab starts clean. Every access is wrapped because Safari private mode
   throws on write rather than failing quietly. */

function readStore() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* private mode, or corrupt JSON — fall through to a fresh seed */
  }
  return null;
}

function writeStore(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Quota or private mode. In-memory state still works for this page view,
       which is enough for a demo — so this is deliberately not surfaced. */
  }
}

function freshState() {
  return { bookings: buildSeed(Date.now()), seededAt: new Date().toISOString() };
}

/* In-memory copy is the source of truth for the page; storage is the mirror. */
let state = readStore() || freshState();
writeStore(state);

const persist = () => writeStore(state);

const clone = (v) => JSON.parse(JSON.stringify(v));

/* -------------------------------------------------------------- ids ------- */
let counter = 0;
const nextId = (prefix) => {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`;
};

const nextRef = () => {
  const nums = state.bookings
    .map((b) => Number((b.ref || '').replace('PP-', '')))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 2400;
  return `PP-${max + 1}`;
};

/* =========================================================================
   Auth
   -------------------------------------------------------------------------
   The login SCREEN is real UI and the production auth behind it is fully
   implemented in api/admin/login.js. It is simply not consulted in demo mode,
   because there is nothing here worth protecting — the data is fictional and
   resets on close.
   ========================================================================= */

export async function login(password) {
  await wait(LATENCY.write);
  /* Any password is accepted. The login screen says so on screen. */
  const session = {
    authed: true,
    demo: true,
    at: new Date().toISOString(),
    used: password ? 'provided' : 'empty',
  };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
  return { ok: true, session };
}

export async function logout() {
  await wait(120);
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  return { ok: true };
}

export async function getSession() {
  await wait(80);
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return { ok: true, session: JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ok: false, session: null };
}

/* =========================================================================
   Bookings
   ========================================================================= */

export async function submitBooking(payload) {
  await wait(LATENCY.write);

  const record = {
    id: nextId('bk'),
    ref: nextRef(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    path: payload.path || 'booking',
    packageSlug: payload.packageSlug || null,
    tierId: payload.tierId || null,
    tierName: payload.tierName || null,
    title: payload.title || 'New booking',
    addons: payload.addons || [],
    vehicle: payload.vehicle || null,
    vehicleCount: payload.vehicleCount ?? 1,
    peopleCount: payload.peopleCount ?? 0,
    locationPref: payload.locationPref || '',
    shotNotes: payload.shotNotes || '',
    scheduledAt: payload.scheduledAt || null,
    durationMinutes: payload.durationMinutes || null,
    lightWindow: payload.lightWindow || null,
    contact: {
      name: payload.contact?.name || '',
      email: payload.contact?.email || '',
      phone: payload.contact?.phone || '',
      source: payload.contact?.source || '',
    },
    /* Every booking arrives as `new`. Nothing is charged at booking time and
       nothing is confirmed — Michael reviews it, quotes it, and sends an
       invoice link afterwards. Payment is a step inside the pipeline now,
       not its entry point. */
    status: 'new',
    flexible: Boolean(payload.flexible),
    read: false,
    notes: '',
    messageCount: 1,
    attachmentCount: 0,
    pricing: payload.pricing || null,
    /* No payment object at creation. Invoices are separate records created by
       Michael from the admin — see the invoice layer. */
    invoices: [],
    /* Marks rows created during this demo session, so they are visually
       distinguishable from the seed in the dashboard. */
    demoCreated: true,
  };

  state.bookings = [record, ...state.bookings];
  persist();

  return { ok: true, booking: clone(record), demo: true };
}

export async function listBookings(query = {}) {
  await wait(LATENCY.read);

  let items = clone(state.bookings);

  if (query.status && query.status !== 'all') {
    items = items.filter((b) => b.status === query.status);
  }
  if (query.path && query.path !== 'all') {
    items = items.filter((b) => b.path === query.path);
  }
  if (query.packageSlug && query.packageSlug !== 'all') {
    items = items.filter((b) => b.packageSlug === query.packageSlug);
  }
  if (query.unreadOnly) {
    items = items.filter((b) => !b.read);
  }
  if (query.search) {
    /* Escape the query before it becomes a regex, or a stray "(" from a phone
       number throws and the search box appears broken. */
    const safe = String(query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(safe, 'i');
    items = items.filter((b) =>
      [
        b.contact.name,
        b.contact.email,
        b.contact.phone,
        b.title,
        b.ref,
        b.vehicle ? `${b.vehicle.year} ${b.vehicle.make} ${b.vehicle.model}` : '',
        b.notes,
        b.shotNotes,
      ]
        .filter(Boolean)
        .some((f) => re.test(f))
    );
  }

  return { ok: true, items, total: items.length, unread: state.bookings.filter((b) => !b.read).length };
}

export async function getBooking(id) {
  await wait(LATENCY.read);
  const found = state.bookings.find((b) => b.id === id);
  return found ? { ok: true, booking: clone(found) } : { ok: false, error: 'not_found' };
}

const ALLOWED_STATUS = [
  'inquiry',
  'consultation-booked',
  'quoted',
  'deposit-paid',
  'scheduled',
  'shot',
  'delivered',
  'cancelled',
];

export async function updateBooking(id, patch) {
  await wait(300);

  const index = state.bookings.findIndex((b) => b.id === id);
  if (index === -1) return { ok: false, error: 'not_found' };

  /* Whitelist, exactly as the production endpoint does — so a bug here cannot
     behave differently from a bug there. */
  const next = { ...state.bookings[index] };
  if (patch.status !== undefined) {
    if (!ALLOWED_STATUS.includes(patch.status)) return { ok: false, error: 'bad_status' };
    next.status = patch.status;
  }
  if (patch.read !== undefined) next.read = Boolean(patch.read);
  if (patch.notes !== undefined) next.notes = String(patch.notes).slice(0, 4000);
  next.updatedAt = new Date().toISOString();

  state.bookings[index] = next;
  persist();

  return { ok: true, booking: clone(next) };
}

export async function markAllRead() {
  await wait(200);
  state.bookings = state.bookings.map((b) => ({ ...b, read: true }));
  persist();
  return { ok: true };
}

/* =========================================================================
   Availability — which slots are already taken
   ========================================================================= */

export async function getBookedSlots() {
  await wait(LATENCY.read);
  const taken = state.bookings
    .filter((b) => b.scheduledAt && b.status !== 'cancelled')
    .map((b) => ({ at: b.scheduledAt, durationMinutes: b.durationMinutes || 90 }));
  return { ok: true, slots: taken };
}

/* =========================================================================
   Invoices — fully stubbed
   -------------------------------------------------------------------------
   NO Stripe SDK is loaded. NO key exists in this build. NO network request is
   made. These functions exist so the real implementation is a drop-in swap and
   the UI never changes.

   The real-world analogue is Stripe Invoicing or Payment Links, which do
   exactly this natively — so production is mostly deleting these stubs, not
   building a payment system. See DEMO-TO-PRODUCTION.md.
   ========================================================================= */

export const DEMO_TEST_CARDS = [
  { number: '4242 4242 4242 4242', brand: 'visa', outcome: 'succeeds', label: 'Payment succeeds' },
  { number: '4000 0000 0000 0002', brand: 'visa', outcome: 'declined', label: 'Card declined' },
];

const digitsOnly = (s = '') => s.replace(/\D/g, '');

export async function createInvoice({ bookingId, lines, kind = 'deposit', dueDate, title }) {
  await wait(LATENCY.write);

  const index = state.bookings.findIndex((b) => b.id === bookingId);
  if (index === -1) return { ok: false, error: 'not_found' };
  const booking = state.bookings[index];

  const totalCents = (lines || []).reduce(
    (sum, l) => sum + (Number(l.amountCents) || 0) * (Number(l.quantity) || 1),
    0
  );

  const seq = state.bookings.reduce((n, b) => n + (b.invoices?.length || 0), 0) + 1;

  const invoice = {
    id: nextId('inv'),
    number: `INV-${String(2400 + seq)}`,
    bookingId,
    title: title || booking.title,
    customerName: booking.contact.name,
    customerEmail: booking.contact.email,
    lines: lines || [],
    kind,
    dueDate: dueDate || null,
    totalCents,
    amountDueCents: totalCents,
    policy: null,
    issuedAt: new Date().toISOString(),
  };

  state.bookings[index] = {
    ...booking,
    invoices: [...(booking.invoices || []), invoice],
    status: booking.status === 'new' || booking.status === 'reviewing' ? 'quote sent' : booking.status,
    updatedAt: new Date().toISOString(),
  };
  persist();

  return { ok: true, invoice: clone(invoice) };
}

export async function getInvoice(id) {
  await wait(LATENCY.read);
  for (const b of state.bookings) {
    const found = (b.invoices || []).find((i) => i.id === id);
    if (found) return { ok: true, invoice: clone(found), state: invoiceState.get(id) };
  }
  return { ok: false, error: 'not_found' };
}

export async function markInvoiceViewed(id) {
  /* No artificial delay — this fires on page load and must not make the
     invoice feel slow to the customer. */
  return { ok: true, state: invoiceState.markViewed(id) };
}

export async function payInvoice({ invoiceId, card = {}, billingName = '' }) {
  await wait(LATENCY.payment);

  const number = digitsOnly(card.number);
  if (number === '4000000000000002') {
    return {
      ok: false,
      demo: true,
      error: 'card_declined',
      message:
        'Your card was declined. Nothing has been charged — try another card, or get in touch and we will sort it out.',
    };
  }

  const payment = {
    intentId: `pi_demo_${Date.now().toString(36)}`,
    receiptRef: `rcpt_demo_${Math.random().toString(36).slice(2, 10)}`,
    brand: card.brand || 'visa',
    last4: number.slice(-4) || '4242',
    billingName,
  };

  const saved = invoiceState.markPaid(invoiceId, payment);

  /* Move the booking along. Paying a deposit is what schedules a shoot. */
  const index = state.bookings.findIndex((b) => (b.invoices || []).some((i) => i.id === invoiceId));
  if (index !== -1) {
    const b = state.bookings[index];
    state.bookings[index] = {
      ...b,
      status: ['new', 'reviewing', 'quote sent'].includes(b.status) ? 'deposit paid' : b.status,
      updatedAt: new Date().toISOString(),
    };
    persist();
  }

  return { ok: true, demo: true, payment: { ...payment, ...saved } };
}

export async function voidInvoice(id) {
  await wait(300);
  return { ok: true, state: invoiceState.markVoid(id) };
}

export async function listInvoices() {
  await wait(LATENCY.read);
  const out = [];
  for (const b of state.bookings) {
    for (const inv of b.invoices || []) {
      out.push({ ...clone(inv), booking: { id: b.id, ref: b.ref, title: b.title }, state: invoiceState.get(inv.id) });
    }
  }
  return { ok: true, items: out.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt)) };
}

/* =========================================================================
   Dashboard aggregates
   ========================================================================= */

export async function getDashboardStats() {
  await wait(LATENCY.read);

  const items = state.bookings;
  const now = Date.now();
  const DAY = 86400000;

  const inWindow = (b, from, to) => {
    const t = new Date(b.createdAt).valueOf();
    return t >= now - to * DAY && t < now - from * DAY;
  };

  const completed = items.filter((b) => ['shot', 'delivered'].includes(b.status));
  const completedThis = completed.filter((b) => inWindow(b, 0, 30)).length;
  const completedPrev = completed.filter((b) => inWindow(b, 30, 60)).length;

  const enquiries = items.length;
  const converted = items.filter((b) =>
    ['deposit-paid', 'scheduled', 'shot', 'delivered'].includes(b.status)
  ).length;
  const conversion = enquiries ? Math.round((converted / enquiries) * 100) : 0;

  const awaitingDeposit = items.filter(
    (b) => b.payment?.status === 'requires_payment' || b.status === 'quoted'
  );

  const revenueThisMonth = items
    .filter((b) => b.payment?.status === 'succeeded' && inWindow(b, 0, 30))
    .reduce((sum, b) => sum + (b.payment.amountCents || 0), 0);
  const revenuePrevMonth = items
    .filter((b) => b.payment?.status === 'succeeded' && inWindow(b, 30, 60))
    .reduce((sum, b) => sum + (b.payment.amountCents || 0), 0);

  /* Eight weekly buckets for the sparkline. */
  const weekly = Array.from({ length: 8 }, (_, i) => {
    const weeksAgo = 7 - i;
    const count = items.filter((b) => {
      const t = new Date(b.createdAt).valueOf();
      return t >= now - (weeksAgo + 1) * 7 * DAY && t < now - weeksAgo * 7 * DAY;
    }).length;
    return { weeksAgo, count };
  });

  const pct = (curr, prev) => {
    if (!prev) return curr ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const upcoming = items
    .filter((b) => b.scheduledAt && new Date(b.scheduledAt) > new Date() && b.status !== 'cancelled')
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const pipeline = ALLOWED_STATUS.map((status) => ({
    status,
    count: items.filter((b) => b.status === status).length,
  }));

  return {
    ok: true,
    stats: {
      completed: { value: completedThis, delta: pct(completedThis, completedPrev), series: weekly },
      conversion: { value: conversion, delta: pct(conversion, 40), series: weekly },
      awaitingDeposit: { value: awaitingDeposit.length, people: awaitingDeposit.map((b) => b.contact.name) },
      revenue: {
        value: revenueThisMonth,
        delta: pct(revenueThisMonth, revenuePrevMonth),
        series: weekly,
      },
      unread: items.filter((b) => !b.read).length,
      pipeline,
      upcoming: clone(upcoming),
      inquiries: buildInquiryFeed(clone(items)),
      weekCapacity: weekCapacity(items),
    },
  };
}

function weekCapacity(items) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const booked = items.filter((b) => {
    if (!b.scheduledAt || b.status === 'cancelled') return false;
    const t = new Date(b.scheduledAt);
    return t >= start && t < end;
  });

  /* PLACEHOLDER: 10 shootable slots a week is an assumption, not Michael's
     real capacity. It lives in the demo source only and is not used by any
     production code path. */
  const capacity = 10;
  return { booked: booked.length, capacity, open: Math.max(0, capacity - booked.length), items: clone(booked) };
}

/* =========================================================================
   Demo-only controls
   ========================================================================= */

export async function resetDemoData() {
  await wait(400);
  state = freshState();
  persist();
  /* Invoice payment status lives in a separate localStorage namespace so a
     copied link survives across tabs — reset has to clear that too, or paid
     invoices from a previous run come back from the dead. */
  invoiceState.reset();
  return { ok: true };
}

export const capabilities = { demo: true, canReset: true };
