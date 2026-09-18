/* ===========================================================================
   API dispatcher.
   ---------------------------------------------------------------------------
   ONE serverless function for the whole API, on purpose.

   Vercel turns every routable file under api/ into its own Serverless
   Function, and the Hobby plan allows twelve per deployment. This project had
   sixteen endpoints, so the build succeeded and the DEPLOY failed immediately
   afterwards, at the point the log reads "Deploying outputs...". A clean
   `vite build` says nothing about that step: the limit is checked while the
   functions are packaged, not while the site is compiled.

   So the endpoints live in api/_handlers/ instead. A leading underscore tells
   Vercel not to route a path, which makes them ordinary modules, and this
   catch-all is the only function. Sixteen becomes one, with room to add more
   endpoints without ever going near the limit again.

   The handlers themselves are untouched. Each is still `(req, res)` with its
   own method checks and its own auth guard; this file only decides which one
   runs. Adding an endpoint means adding a file and one line to ROUTES.
   =========================================================================== */

import availability from './_handlers/availability.js';
import bookings from './_handlers/bookings.js';
import content from './_handlers/content.js';
import invoices from './_handlers/invoices.js';

import adminBookings from './_handlers/admin/bookings.js';
import adminContent from './_handlers/admin/content.js';
import adminInvoices from './_handlers/admin/invoices.js';
import adminLogin from './_handlers/admin/login.js';
import adminLogout from './_handlers/admin/logout.js';
import adminPublish from './_handlers/admin/publish.js';
import adminPublishHistory from './_handlers/admin/publish-history.js';
import adminSession from './_handlers/admin/session.js';
import adminStats from './_handlers/admin/stats.js';
import adminUpload from './_handlers/admin/upload.js';

import invoicesPay from './_handlers/invoices/pay.js';
import invoicesViewed from './_handlers/invoices/viewed.js';

/* Keys are the path after /api/, exactly as the old filenames resolved.
   `invoices` and `invoices/pay` are both present and distinct, which is why
   this is an explicit map rather than anything clever with prefixes. */
const ROUTES = {
  'availability': availability,
  'bookings': bookings,
  'content': content,
  'invoices': invoices,
  'invoices/pay': invoicesPay,
  'invoices/viewed': invoicesViewed,

  'admin/bookings': adminBookings,
  'admin/content': adminContent,
  'admin/invoices': adminInvoices,
  'admin/login': adminLogin,
  'admin/logout': adminLogout,
  'admin/publish': adminPublish,
  'admin/publish-history': adminPublishHistory,
  'admin/session': adminSession,
  'admin/stats': adminStats,
  'admin/upload': adminUpload,
};

export default async function handler(req, res) {
  /* Vercel puts the matched segments in req.query.route. Falling back to the
     URL keeps this function runnable by anything that calls it directly,
     which is what the local QA harness does. */
  const segments = Array.isArray(req.query?.route)
    ? req.query.route
    : String(req.url || '').split('?')[0].replace(/^\/api\/?/, '').split('/');

  const path = segments.filter(Boolean).join('/');
  const route = ROUTES[path];

  if (!route) {
    return res.status(404).json({ error: 'not_found', message: `No API route at /api/${path}` });
  }

  return route(req, res);
}
