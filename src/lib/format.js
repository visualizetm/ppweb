/* Shared formatting. Money is always handled in whole cents — never floats. */

export const formatMoney = (cents, { showCents = false } = {}) => {
  if (cents === null || cents === undefined) return '—';
  const value = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents || value % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (value, opts = {}) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.valueOf())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...opts,
  }).format(d);
};

export const formatTime = (value, timeZone) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.valueOf())) return '';
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...(timeZone ? { timeZone } : {}),
  }).format(d);
};

export const formatDateTime = (value) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.valueOf())) return '';
  return `${formatDate(d)} · ${formatTime(d)}`;
};

/** "3 days ago", "in 2h 16m" — the dashboard leans on this heavily. */
export const relativeTime = (value, now = Date.now()) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.valueOf())) return '';

  const diff = d.valueOf() - now;
  const future = diff > 0;
  const abs = Math.abs(diff);

  const mins = Math.floor(abs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (future) {
    if (mins < 1) return 'Now';
    if (hours < 1) return `In ${mins}m`;
    if (days < 1) return `In ${hours}h ${mins % 60}m`;
    if (days < 7) return `In ${days}d ${hours % 24}h`;
    return `In ${Math.floor(days / 7)}w`;
  }

  if (mins < 1) return 'Just now';
  if (hours < 1) return `${mins}m ago`;
  if (days < 1) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

/** Initials for the monogram avatars used across the dashboard. */
export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || '')
    .join('')
    .toUpperCase();

/** Deterministic hue from a string, so a given person always gets the same
    avatar colour without storing one. */
export const hueFromString = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) % 360;
  }
  return h;
};

export const truncate = (str = '', max = 90) =>
  str.length <= max ? str : `${str.slice(0, max - 1).trimEnd()}…`;

/** ISO YYYY-MM-DD in LOCAL time. `toISOString()` would shift the day for
    anyone west of Greenwich, which silently books the wrong date. */
export const isoDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
