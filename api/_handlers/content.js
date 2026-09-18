import { readPublished } from '../_lib/content.js';

/* PUBLIC. Returns published site content only. Never exposes drafts, and never
   requires a session: this is what every visitor's first paint depends on. */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  try {
    const content = await readPublished();

    /* NOT CACHED, DELIBERATELY.
       This started life as `s-maxage=60, stale-while-revalidate=600`, which
       browsers honour: after publishing, Chrome kept serving the previous
       response from its own cache and the site appeared not to have changed
       for up to ten minutes. The entire promise of the publish button is that
       you press it and the site changes, so a caching layer that can silently
       break that promise is worse than the read it saves. This is one small
       JSON document on a low traffic site.

       If this ever needs a cache, it needs a purge on publish to go with it —
       not a stale window. */
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, content });
  } catch (err) {
    /* The site must still render if the database is unreachable. The client
       falls back to the defaults baked into the bundle. */
    return res.status(503).json({ error: 'content_unavailable' });
  }
}
