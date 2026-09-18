/* ===========================================================================
   Which site is this.
   ---------------------------------------------------------------------------
   One Vercel project serves two hostnames off the same build:

     papsprod.com            the marketing site, plus /invoice/:token
     dashboard.papsprod.com  the owner dashboard, at the root

   Same origin per host, which is what makes the session cookie work without
   any CORS or cross-site cookie handling: the dashboard calls /api/... on
   dashboard.papsprod.com, and the HttpOnly cookie set there is scoped to that
   host and never leaks onto the public site.

   The check is a PREFIX, not an exact match, so it holds for a preview
   deployment aliased to dashboard-something and for a future staging host
   without another edit here.
   =========================================================================== */

export const DASHBOARD_PREFIX = 'dashboard.';

/** True when the current hostname is the dashboard. */
export function isDashboardHost(hostname) {
  const host = hostname ?? (typeof window === 'undefined' ? '' : window.location.hostname);
  return host.toLowerCase().startsWith(DASHBOARD_PREFIX);
}

/**
 * The dashboard's address as seen from the marketing site.
 * Returns null anywhere the subdomain cannot exist, which is localhost and
 * the *.vercel.app preview URLs. Callers use that to mean "stay put and keep
 * serving the dashboard at /admin", so a preview deployment is still usable.
 */
export function dashboardUrl(hostname) {
  const host = (hostname ?? (typeof window === 'undefined' ? '' : window.location.hostname)).toLowerCase();
  if (!host || host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return null;
  if (host.endsWith('.vercel.app')) return null;
  if (isDashboardHost(host)) return `https://${host}`;
  return `https://${DASHBOARD_PREFIX}${host.replace(/^www\./, '')}`;
}
