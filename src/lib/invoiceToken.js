/* ===========================================================================
   Invoice tokens.
   ---------------------------------------------------------------------------
   WHY THIS EXISTS, AND WHY IT DEVIATES FROM THE SKILL

   Demo state normally lives in sessionStorage. A copyable invoice link breaks
   that assumption completely: the entire point is that Michael sends the link
   and the customer opens it somewhere else — another tab, another browser,
   their phone. sessionStorage is empty there, so the invoice would not exist
   and the demo would fail at exactly the moment it needs to land.

   So the invoice payload is encoded INTO the token: base64url JSON in the URL.
   The invoice page renders entirely from the token with no shared state, which
   means a pasted link works cold on any device.

   Payment status is a separate concern — see paidStore below. It mirrors to
   localStorage so paying in one tab shows up in the admin in another on the
   same machine. That is the one piece that cannot ride in the URL, because the
   URL is fixed once it is sent.

   IN PRODUCTION none of this survives: the token becomes a real Stripe invoice
   id and the payload lives server-side. Documented in DEMO-TO-PRODUCTION.md.
   =========================================================================== */

const PAID_KEY = 'pp_demo_invoices_v1';

/* --- base64url, unicode-safe ------------------------------------------- */
const toB64Url = (str) => {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64Url = (token) => {
  const padded = token.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

/** Encode an invoice into a URL-safe token. */
export function encodeInvoice(invoice) {
  /* Short keys: the token ends up in a text message, and a 900-character URL
     looks like something you should not click. */
  const compact = {
    i: invoice.id,
    n: invoice.number,
    b: invoice.bookingId,
    t: invoice.title,
    c: invoice.customerName,
    e: invoice.customerEmail,
    l: invoice.lines.map((x) => [x.description, x.quantity, x.amountCents]),
    d: invoice.dueDate,
    k: invoice.kind, // 'deposit' | 'balance' | 'full'
    o: invoice.totalCents,
    a: invoice.amountDueCents,
    p: invoice.policy,
    s: invoice.issuedAt,
  };
  return toB64Url(JSON.stringify(compact));
}

/** Decode a token back into an invoice. Returns null if it is not ours. */
export function decodeInvoice(token) {
  if (!token) return null;
  try {
    const c = JSON.parse(fromB64Url(token));
    if (!c || !c.i || !Array.isArray(c.l)) return null;
    return {
      id: c.i,
      number: c.n,
      bookingId: c.b,
      title: c.t,
      customerName: c.c,
      customerEmail: c.e,
      lines: c.l.map(([description, quantity, amountCents]) => ({
        description,
        quantity,
        amountCents,
      })),
      dueDate: c.d,
      kind: c.k,
      totalCents: c.o,
      amountDueCents: c.a,
      policy: c.p,
      issuedAt: c.s,
    };
  } catch {
    return null;
  }
}

export const invoiceUrl = (invoice, origin = window.location.origin) =>
  `${origin}/invoice/${encodeInvoice(invoice)}`;

/* =========================================================================
   Payment + view status.
   -------------------------------------------------------------------------
   localStorage, not sessionStorage, and deliberately so: the whole point is
   that the state survives being opened in a different tab. Namespaced, and
   cleared by the admin's "Reset demo data" control.
   ========================================================================= */

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(PAID_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeAll(map) {
  try {
    localStorage.setItem(PAID_KEY, JSON.stringify(map));
    /* Same-tab listeners do not get a storage event, so fire our own. */
    window.dispatchEvent(new CustomEvent('pp:invoices', { detail: map }));
  } catch {
    /* private mode — in-memory for this page view only */
  }
}

export const invoiceState = {
  get(id) {
    return readAll()[id] || null;
  },

  all() {
    return readAll();
  },

  markViewed(id) {
    const map = readAll();
    const existing = map[id];
    /* Only the FIRST view is recorded. "Opened 3 days ago" is what is useful
       to a freelancer chasing a payment; a constantly-updating timestamp is
       just noise. */
    if (existing?.viewedAt) return existing;
    map[id] = { ...(existing || {}), viewedAt: new Date().toISOString() };
    writeAll(map);
    return map[id];
  },

  markPaid(id, payment) {
    const map = readAll();
    map[id] = { ...(map[id] || {}), ...payment, paidAt: new Date().toISOString() };
    writeAll(map);
    return map[id];
  },

  markVoid(id) {
    const map = readAll();
    map[id] = { ...(map[id] || {}), voidedAt: new Date().toISOString() };
    writeAll(map);
    return map[id];
  },

  reset() {
    try {
      localStorage.removeItem(PAID_KEY);
      window.dispatchEvent(new CustomEvent('pp:invoices', { detail: {} }));
    } catch {
      /* ignore */
    }
  },

  subscribe(fn) {
    const onCustom = (e) => fn(e.detail);
    const onStorage = (e) => {
      if (e.key === PAID_KEY) fn(readAll());
    };
    window.addEventListener('pp:invoices', onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('pp:invoices', onCustom);
      window.removeEventListener('storage', onStorage);
    };
  },
};

/** draft -> sent -> viewed -> paid, plus overdue and cancelled. */
export function invoiceStatus(invoice, state) {
  if (!invoice) return 'draft';
  const s = state || invoiceState.get(invoice.id);
  if (s?.voidedAt) return 'cancelled';
  if (s?.paidAt) return 'paid';
  if (invoice.dueDate && new Date(invoice.dueDate) < new Date()) return 'overdue';
  if (s?.viewedAt) return 'viewed';
  return 'sent';
}

export const STATUS_LABEL = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Opened',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export const STATUS_TONE = {
  draft: '',
  sent: 'badge-info',
  viewed: 'badge-warn',
  paid: 'badge-ok',
  overdue: 'badge-alert',
  cancelled: '',
};
