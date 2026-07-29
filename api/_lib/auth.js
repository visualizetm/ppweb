import crypto from 'node:crypto';

/* Stateless signed-cookie sessions. Token is "<expiryMs>.<HMAC>" base64url'd,
   so there is no session store to run and nothing to expire server-side. */

const SECRET = process.env.SESSION_SECRET || '';
const TTL_MS = 1000 * 60 * 60 * 12;
const COOKIE = 'pp_session';

const sign = (value) =>
  crypto.createHmac('sha256', SECRET).update(String(value)).digest('base64url');

export function makeToken(ttl = TTL_MS) {
  const expiry = Date.now() + ttl;
  return Buffer.from(`${expiry}.${sign(expiry)}`).toString('base64url');
}

export function checkToken(token) {
  if (!token || !SECRET) return false;
  try {
    const [expiry, mac] = Buffer.from(token, 'base64url').toString().split('.');
    if (!expiry || !mac) return false;
    if (Number(expiry) < Date.now()) return false;

    const expected = Buffer.from(sign(expiry));
    const given = Buffer.from(mac);
    /* Length check first — timingSafeEqual throws on a length mismatch. */
    if (expected.length !== given.length) return false;
    return crypto.timingSafeEqual(expected, given);
  } catch {
    return false;
  }
}

export const sessionCookie = (token, maxAgeSec = TTL_MS / 1000) =>
  `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSec}`;

export const clearCookie = () =>
  `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;

export function isAuthed(req) {
  const raw = req.headers.cookie || '';
  const match = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  return checkToken(match?.slice(COOKIE.length + 1));
}

/** Guard. Returns false and 401s when the caller is not signed in. */
export function requireAdmin(req, res) {
  if (isAuthed(req)) return true;
  res.status(401).json({ error: 'unauthorized' });
  return false;
}

/** Timing-safe password compare against ADMIN_PASSWORD. */
export function passwordOk(given) {
  const real = process.env.ADMIN_PASSWORD || '';
  if (!real) return false;
  const a = crypto.createHash('sha256').update(String(given ?? '')).digest();
  const b = crypto.createHash('sha256').update(real).digest();
  return crypto.timingSafeEqual(a, b);
}
