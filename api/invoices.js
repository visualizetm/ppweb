import { ObjectId } from 'mongodb';
import { invoices } from './_lib/mongo';

/* PUBLIC — an invoice is opened cold from a link, with no account and no
   login. It returns only what the invoice page needs to render. There is no
   listing endpoint here on purpose: you must already know the id. */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id_required' });

  try {
    const col = await invoices();
    const inv = await col.findOne({ _id: new ObjectId(String(id)) });
    if (!inv) return res.status(404).json({ error: 'not_found' });

    return res.status(200).json({
      ok: true,
      invoice: { ...inv, id: String(inv._id), _id: undefined },
      state: { viewedAt: inv.viewedAt, paidAt: inv.paidAt, voidedAt: inv.voidedAt },
    });
  } catch {
    return res.status(404).json({ error: 'not_found' });
  }
}
