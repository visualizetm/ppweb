import { siteContent, publishHistory } from '../../_lib/mongo.js';
import { requireAdmin } from '../../_lib/auth.js';
import { readAllSections } from '../../_lib/content.js';
import { getSection, changedFields, collectImageUrls } from '../../../shared/content-schema.js';
import { v2 as cloudinary } from 'cloudinary';
import { configure as cloudinaryReady, publicIdFromUrl } from './upload.js';

/* ===========================================================================
   Publish.
   ---------------------------------------------------------------------------
   The only route by which anything reaches the public site. Copies `draft`
   into `published` for the named sections and records what went out.

   GET  -> what is currently staged, so the confirmation popup can list it
   POST -> publish the named sections
   =========================================================================== */

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  /* ------------------------------------------------------------- GET --- */
  if (req.method === 'GET') {
    const rows = await readAllSections();
    const pending = rows
      .map((row) => ({
        section: row.section,
        label: getSection(row.section)?.label || row.section,
        changed: changedFields(row.section, row.draft, row.published),
        updatedAt: row.updatedAt,
      }))
      .filter((row) => row.changed.length > 0);

    return res.status(200).json({ ok: true, pending, count: pending.length });
  }

  /* ------------------------------------------------------------ POST --- */
  if (req.method === 'POST') {
    const wanted = Array.isArray(req.body?.sections) ? req.body.sections : [];
    if (!wanted.length) return res.status(400).json({ error: 'nothing_selected' });

    const rows = await readAllSections();
    const byId = new Map(rows.map((r) => [r.section, r]));

    /* Recompute what changed server-side. The client sends which sections to
       publish, never what to publish, so a stale dashboard cannot push
       something the operator did not see in the confirmation list. */
    const publishing = wanted
      .filter((id) => byId.has(id))
      .map((id) => {
        const row = byId.get(id);
        return {
          section: id,
          label: getSection(id)?.label || id,
          changed: changedFields(id, row.draft, row.published),
        };
      })
      .filter((row) => row.changed.length > 0);

    if (!publishing.length) {
      return res.status(200).json({ ok: true, published: [], message: 'Nothing had changed.' });
    }

    const col = await siteContent();
    const now = new Date();

    /* Images that were live before this publish. Anything in here that is
       referenced by nothing afterwards is destroyed in storage below. */
    const wasLive = new Set();
    publishing.forEach((row) => collectImageUrls(byId.get(row.section).published, wasLive));

    /* Sequential rather than bulk so a single bad section cannot silently
       take the rest of the publish down with it. Nine sections at most. */
    for (const row of publishing) {
      const current = byId.get(row.section);
      await col.updateOne(
        { section: row.section },
        { $set: { published: current.draft, publishedAt: now, updatedAt: now } }
      );
    }

    /* Retire assets nothing references any more: not this or any other
       section's published copy, and not any draft either (a draft may still
       be holding an image for a later publish). Failures here are logged and
       never fail the publish; an orphaned file is a cost, a lost publish is
       not. */
    let destroyed = 0;
    if (wasLive.size && cloudinaryReady()) {
      const stillUsed = new Set();
      (await readAllSections()).forEach((row) => {
        collectImageUrls(row.published, stillUsed);
        collectImageUrls(row.draft, stillUsed);
      });
      for (const url of wasLive) {
        if (stillUsed.has(url)) continue;
        const publicId = publicIdFromUrl(url);
        if (!publicId) continue;
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
          destroyed += 1;
        } catch (err) {
          console.error('[publish] could not destroy', publicId, err?.message);
        }
      }
    }

    const history = await publishHistory();
    const entry = {
      sections: publishing.map((r) => ({
        section: r.section,
        label: r.label,
        changed: r.changed,
      })),
      summary: publishing
        .map((r) => `${r.label}: ${r.changed.join(', ')}`)
        .join(' | ')
        .slice(0, 2000),
      publishedAt: now,
    };
    const { insertedId } = await history.insertOne(entry);

    return res.status(200).json({
      ok: true,
      published: publishing.map((r) => r.section),
      destroyed,
      entry: { ...entry, id: String(insertedId) },
    });
  }

  return res.status(405).json({ error: 'method_not_allowed' });
}
