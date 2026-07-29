/* ===========================================================================
   The seam.
   ---------------------------------------------------------------------------
   Every module in this app reads and writes through this file. No component
   anywhere calls fetch('/api/...') directly — swapping the implementation is
   the entire promotion path from demo to production, and it only works if
   there is exactly one place where the swap happens.

   Flip VITE_DEMO_MODE in .env.production and everything below repoints. No
   component changes, no prop changes, no refactor.
   =========================================================================== */

import * as demo from './sources/demo';
import * as live from './sources/live';

/* VITE_DEMO_MODE is a public feature flag, not a secret — it is safe to inline
   into the client bundle, and it is the only VITE_ variable this project uses
   anywhere near auth. Any real secret is read server-side only. */
export const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

const source = isDemo ? demo : live;

/* Guard against the two modules drifting apart. In a demo build this is the
   difference between finding the problem now and finding it when the client
   flips the flag and the dashboard goes blank. */
if (import.meta.env.DEV) {
  const missing = Object.keys(demo).filter((k) => !(k in live));
  const extra = Object.keys(live).filter((k) => !(k in demo));
  if (missing.length || extra.length) {
    console.warn(
      '[dataSource] demo.js and live.js have drifted apart.',
      missing.length ? `Missing from live.js: ${missing.join(', ')}.` : '',
      extra.length ? `Missing from demo.js: ${extra.join(', ')}.` : ''
    );
  }
}

export const {
  /* auth */
  login,
  logout,
  getSession,
  /* bookings */
  submitBooking,
  listBookings,
  getBooking,
  updateBooking,
  markAllRead,
  /* availability */
  getBookedSlots,
  /* invoices */
  createInvoice,
  getInvoice,
  markInvoiceViewed,
  payInvoice,
  voidInvoice,
  listInvoices,
  DEMO_TEST_CARDS,
  /* dashboard */
  getDashboardStats,
  /* demo-only */
  resetDemoData,
  capabilities,
} = source;

export default source;
