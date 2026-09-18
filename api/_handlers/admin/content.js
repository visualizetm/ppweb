import { requireAdmin } from '../../_lib/auth';
import { readAllSections, writeDraft, revertDraft } from '../../_lib/content';
import { SECTIONS, changedFields } from '../../../shared/content-schema.js';

/* ADMIN. Draft and published side by side, plus which fields differ. */
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    const rows = await readAllSections();
    return res.status(200).json({
      ok: true,
      sections: rows.map((row) => ({
        ...row,
        changed: changedFields(row.section, row.draft, row.published),
      })),
      schema: SECTIONS,
    });
  }

  if (req.method === 'PUT') {
    const { section, draft } = req.body || {};
    const saved = await writeDraft(section, draft);
    if (!saved) return res.status(400).json({ error: 'unknown_section' });
    return res.status(200).json({ ok: true, section, draft: saved });
  }

  if (req.method === 'PATCH') {
    const { section, revert } = req.body || {};
    if (!revert) return res.status(400).json({ error: 'bad_request' });
    const reverted = await revertDraft(section);
    if (!reverted) return res.status(404).json({ error: 'not_found' });
    return res.status(200).json({ ok: true, section, draft: reverted });
  }

  return res.status(405).json({ error: 'method_not_allowed' });
}
