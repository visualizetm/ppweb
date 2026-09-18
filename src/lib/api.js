/* ===========================================================================
   API client.
   ---------------------------------------------------------------------------
   THIS IS THE ONLY FILE IN src/ PERMITTED TO CALL fetch('/api/...').
   scripts/smoke.sh enforces it; a component reaching for the network directly
   fails the smoke test. Everything else imports named functions from here, so
   there is exactly one place where request shapes, credentials and error
   handling are decided.
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

/* ------------------------------------------------------------- dashboard -- */

export const getDashboardStats = () => call('/api/admin/stats');

/* --------------------------------------------------------------- content -- */
/* Public read returns PUBLISHED content only. The admin read returns draft and
   published side by side so the dashboard can show what is staged. */

export const getPublishedContent = (signal) => call('/api/content', { signal });

export const getAdminContent = () => call('/api/admin/content');

export const saveContentDraft = (section, draft) =>
  call('/api/admin/content', { method: 'PUT', body: { section, draft } });

export const revertContentDraft = (section) =>
  call('/api/admin/content', { method: 'PATCH', body: { section, revert: true } });

export const getPendingChanges = () => call('/api/admin/publish');

export const publishSections = (sections) =>
  call('/api/admin/publish', { method: 'POST', body: { sections } });

export const listPublishHistory = () => call('/api/admin/publish-history');

/* ----------------------------------------------------------------- media -- */

/** Uploads a single already-resized File/Blob. Multipart, so no JSON wrapper. */
export async function uploadImage(file, { folder = 'uploads', signal } = {}) {
  try {
    const form = new FormData();
    form.append('file', file, file.name || 'upload.jpg');
    form.append('folder', folder);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: form,
      credentials: 'same-origin',
      signal,
    });

    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!res.ok) {
      return {
        ok: false,
        error: data?.error || `http_${res.status}`,
        message: data?.message || 'That upload did not go through.',
      };
    }
    return { ok: true, ...(data || {}) };
  } catch (err) {
    if (err?.name === 'AbortError') return { ok: false, error: 'aborted' };
    return { ok: false, error: 'network', message: 'Could not reach the server.' };
  }
}

export const deleteImage = (url) =>
  call('/api/admin/upload', { method: 'DELETE', body: { url } });
