import { readPublished } from './_lib/content';

/* PUBLIC. Returns published site content only. Never exposes drafts, and never
   requires a session: this is what every visitor's first paint depends on. */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  try {
    const content = await readPublished();
    /* Short shared cache with a long stale window. A publish is not urgent
       enough to justify an uncached read on every page view, and the admin
       sees its own draft anyway. */
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600');
    return res.status(200).json({ ok: true, content });
  } catch (err) {
    /* The site must still render if the database is unreachable. The client
       falls back to the defaults baked into the bundle. */
    return res.status(503).json({ error: 'content_unavailable' });
  }
}
