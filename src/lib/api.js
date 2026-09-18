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

/* ===========================================================================
   Failure reporting.
   ---------------------------------------------------------------------------
   For most of this project's life, any reply that was not clean JSON collapsed
   into "Something went wrong. Please try again." That one string hid a routing
   failure that 404'd every API call, because a 404 HTML page and a wrong
   password looked identical on screen.

   So every failure now says what actually came back. Three distinct shapes:

     server   the API answered with JSON. Its own `message` is shown verbatim
              when it sent one (the vague 401 for a wrong password stays vague,
              deliberately). Without one, the status and its error code.
     not-json a response arrived but it was not JSON: an HTML 404 from the
              platform, a crashed function's error page, or the website's own
              index.html served where the API should be. Status, content type
              and the endpoint are all shown, because those three facts are
              exactly what it takes to diagnose it without opening Vercel.
     network  fetch threw before any response existed. Offline, DNS, a blocked
              request. Never confused with a server-side failure.

   What is NOT shown: stack traces, environment variable names, file paths, or
   anything the server did not already choose to send. The status code and
   content type are facts about the HTTP exchange, not about the code.
   =========================================================================== */

const STATUS_TEXT = {
  400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found',
  405: 'Method Not Allowed', 408: 'Request Timeout', 409: 'Conflict',
  413: 'Payload Too Large', 415: 'Unsupported Media Type', 429: 'Too Many Requests',
  500: 'Internal Server Error', 501: 'Not Implemented', 502: 'Bad Gateway',
  503: 'Service Unavailable', 504: 'Gateway Timeout',
};

const statusLabel = (status) =>
  STATUS_TEXT[status] ? `${status} ${STATUS_TEXT[status]}` : String(status);

/** A plain-language category for a status, for the cases the server said nothing. */
function category(status) {
  if (status === 404) return 'the endpoint could not be reached';
  if (status === 401 || status === 403) return 'the request was not authorised';
  if (status === 405) return 'the endpoint refused this request method';
  if (status === 429) return 'too many requests';
  if (status >= 500) return 'server error';
  if (status >= 400) return 'the request was rejected';
  return 'unexpected reply';
}

/** Endpoint path without its query string, for messages. */
const endpointOf = (path) => String(path).split('?')[0];

/**
 * Turns a fetch Response into the {ok, ...} shape every caller expects.
 * Shared by call() and uploadImage() so the two cannot drift.
 */
async function interpret(res, path) {
  const text = await res.text();
  const contentType = (res.headers.get('content-type') || '').split(';')[0].trim();

  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  const isJson = data !== null && typeof data === 'object';

  if (res.ok && isJson) return { ok: true, ...data };

  const status = res.status;
  const label = statusLabel(status);
  const endpoint = endpointOf(path);

  /* A 2xx that is not JSON is almost always index.html being served in place
     of the API, which means a rewrite is wrong. Treating it as success would
     hand the caller an empty object and hide the problem completely. */
  if (res.ok && !isJson) {
    return {
      ok: false,
      status,
      kind: 'not-json',
      error: 'not_json',
      message:
        `Request failed: ${label}, but the reply was ${contentType || 'not JSON'} instead of JSON. ` +
        `${endpoint} is being answered by the website page, not the API.`,
    };
  }

  if (isJson && data.message) {
    return { ok: false, status, kind: 'server', error: data.error || `http_${status}`, message: String(data.message) };
  }

  if (isJson) {
    const code = data.error ? ` (${data.error})` : '';
    return {
      ok: false,
      status,
      kind: 'server',
      error: data.error || `http_${status}`,
      message: `Request failed: ${label}, ${category(status)}${code}.`,
    };
  }

  return {
    ok: false,
    status,
    kind: 'not-json',
    error: `http_${status}`,
    message:
      `Request failed: ${label}, ${category(status)}. ` +
      `The reply was ${contentType || 'not JSON'} instead of JSON, so ${endpoint} was not answered by the API.`,
  };
}

/** What a thrown fetch becomes. Distinct wording so it is never mistaken for
    a server-side failure: no response ever arrived. */
function networkFailure(err) {
  if (err?.name === 'AbortError') return { ok: false, kind: 'aborted', error: 'aborted', message: 'Request cancelled.' };
  return {
    ok: false,
    kind: 'network',
    error: 'network',
    message: 'Could not reach the server. Check your connection.',
  };
}

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
    return await interpret(res, path);
  } catch (err) {
    return networkFailure(err);
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

/**
 * Uploads one already-resized image. The body is the raw bytes and the
 * filename rides in the query string, so there is no multipart parser on
 * either side of the wire.
 *
 * @param {Blob} blob  output of prepareImage()
 */
export async function uploadImage(blob, { folder = 'uploads', name = 'image', signal } = {}) {
  try {
    const path = `/api/admin/upload${qs({ folder, name })}`;
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': blob.type || 'image/jpeg' },
      body: blob,
      credentials: 'same-origin',
      signal,
    });
    return await interpret(res, path);
  } catch (err) {
    return networkFailure(err);
  }
}

export const deleteImage = (url) =>
  call('/api/admin/upload', { method: 'DELETE', body: { url } });
