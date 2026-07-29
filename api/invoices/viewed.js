import { ObjectId } from 'mongodb';
import { invoices } from '../_lib/mongo';

/* Records the FIRST open only. "Opened 3 days ago" is what is useful to
   someone chasing a payment; a timestamp that resets on every refresh is not. */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id_required' });

  try {
    const col = await invoices();
    await col.updateOne(
      { _id: new ObjectId(String(id)), viewedAt: null },
      { $set: { viewedAt: new Date() } }
    );
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(200).json({ ok: true });
  }
}
