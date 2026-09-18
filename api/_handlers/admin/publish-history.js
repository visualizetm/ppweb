import { publishHistory } from '../../_lib/mongo';
import { requireAdmin } from '../../_lib/auth';

/* Reverse chronological record of every publish. Read only by design: a
   publish that happened cannot be edited out of the log. */
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  const col = await publishHistory();
  const items = await col.find({}).sort({ publishedAt: -1 }).limit(200).toArray();

  return res.status(200).json({
    ok: true,
    items: items.map((i) => ({ ...i, id: String(i._id), _id: undefined })),
  });
}
