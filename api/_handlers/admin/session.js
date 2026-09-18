import { isAuthed } from '../../_lib/auth.js';

/* Answers "am I signed in?". A NO is a successful answer, not an error, so it
   is a 200 with authed:false. It used to be a 401, which made every browser
   print "Failed to load resource: 401" in the console on the login page for
   what was the normal logged-out state. Real admin endpoints still 401. */
export default async function handler(req, res) {
  const ok = isAuthed(req);
  return res.status(200).json({ ok, session: ok ? { authed: true } : null });
}
