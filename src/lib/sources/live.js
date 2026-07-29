/* ===========================================================================
   Live data source.
   ---------------------------------------------------------------------------
   The real network layer. Identical function signatures to ./demo.js — if you
   add a function to one, add it to the other, or flipping VITE_DEMO_MODE will
   break at runtime instead of at build time.

   THIS IS THE ONLY FILE IN src/ PERMITTED TO CALL fetch('/api/...').
   scripts/smoke.sh enforces that; a component reaching for the network
   directly fails the smoke test.
   =========================================================================== */

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** Single fetch wrapper so error shapes are consistent everywhere. */
async function call(path, { method = 'GET', body, signal } = {}) {
  try {
    const res = await fetch(path, {
      method,
      headers: body ? JSON_HEADERS : undefined,
      body: body ? JSON.stringify(body) : undefined,
      /* Session cookie is HttpOnly and set server-side; it must ride along. */
      credentials: 'same-origin',
      signal,
    });

    let data = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data?.error || `http_${res.status}`,
        message: data?.message || 'Something went wrong. Please try again.',
      };
    }

    return { ok: true, ...(data || {}) };
  } catch (err) {
    if (err?.name === 'AbortError') return { ok: false, error: 'aborted' };
    return {
      ok: false,
      error: 'network',
      message: 'Could not reach the server. Check your connection and try again.',
    };
  }
}

const qs = (query = {}) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : '';
};

/* ------------------------------------------------------------------ auth -- */

export const login = (password) =>
  call('/api/admin/login', { method: 'POST', body: { password } });

export const logout = () => call('/api/admin/logout', { method: 'POST' });

export const getSession = () => call('/api/admin/session');

/* -------------------------------------------------------------- bookings -- */

export const submitBooking = (payload) =>
  call('/api/bookings', { method: 'POST', body: payload });

export const listBookings = (query = {}) => call(`/api/admin/bookings${qs(query)}`);

export const getBooking = (id) => call(`/api/admin/bookings${qs({ id })}`);

export const updateBooking = (id, patch) =>
  call('/api/admin/bookings', { method: 'PATCH', body: { id, ...patch } });

export const markAllRead = () =>
  call('/api/admin/bookings', { method: 'PATCH', body: { markAllRead: true } });

/* ---------------------------------------------------------- availability -- */

export const getBookedSlots = () => call('/api/availability');

/* -------------------------------------------------------------- invoices -- */
/* These hit the server, which holds STRIPE_SECRET_KEY. The secret key never
   reaches the browser and is never given a VITE_ prefix. */

export const createInvoice = (body) =>
  call('/api/admin/invoices', { method: 'POST', body });

export const getInvoice = (id) => call(`/api/invoices${qs({ id })}`);

export const markInvoiceViewed = (id) =>
  call('/api/invoices/viewed', { method: 'POST', body: { id } });

export const payInvoice = ({ invoiceId, paymentMethodId }) =>
  call('/api/invoices/pay', { method: 'POST', body: { invoiceId, paymentMethodId } });

export const voidInvoice = (id) =>
  call('/api/admin/invoices', { method: 'PATCH', body: { id, void: true } });

export const listInvoices = () => call('/api/admin/invoices');

/* Test cards are a demo-only affordance. Exported empty so any component that
   reads it renders nothing in production without needing an isDemo check. */
export const DEMO_TEST_CARDS = [];

/* ------------------------------------------------------------- dashboard -- */

export const getDashboardStats = () => call('/api/admin/stats');

/* ------------------------------------------------------------ demo-only --- */

/** Not available in production — there is no seeded data to reset. Returns a
    refusal rather than throwing so a stray call cannot crash the dashboard. */
export const resetDemoData = async () => ({ ok: false, error: 'not_available_in_production' });

export const capabilities = { demo: false, canReset: false };
