import { ObjectId } from 'mongodb';
import { invoices, bookings } from '../_lib/mongo';

/* PRODUCTION NOTE — THIS IS A STUB AND MUST NOT SHIP AS-IS.

   Card details must never reach this server. The real implementation is:
     1. the browser collects the card with Stripe Elements and gets a
        PaymentMethod id — the card itself never touches our origin
     2. this endpoint confirms a PaymentIntent for that PaymentMethod using
        STRIPE_SECRET_KEY, which is read here and never sent to the client
     3. a separate webhook handler for invoice.paid marks the record paid

   Marking an invoice paid from a client request, as below, is only acceptable
   while the whole payment layer is stubbed. Replace before going live.
   See DEMO-TO-PRODUCTION.md section 4. */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(501).json({
      error: 'not_implemented',
      message: 'Payments are not connected yet. See DEMO-TO-PRODUCTION.md.',
    });
  }

  const { invoiceId } = req.body || {};
  if (!invoiceId) return res.status(400).json({ error: 'id_required' });

  try {
    const col = await invoices();
    const inv = await col.findOne({ _id: new ObjectId(String(invoiceId)) });
    if (!inv) return res.status(404).json({ error: 'not_found' });
    if (inv.paidAt) return res.status(200).json({ ok: true, payment: { paidAt: inv.paidAt } });

    /* --- Stripe confirmation goes here --- */

    await col.updateOne({ _id: inv._id }, { $set: { paidAt: new Date() } });
    const bCol = await bookings();
    await bCol.updateOne(
      { _id: new ObjectId(inv.bookingId), status: { $in: ['new', 'reviewing', 'quote sent'] } },
      { $set: { status: 'deposit paid', updatedAt: new Date() } }
    );

    return res.status(200).json({ ok: true, payment: { paidAt: new Date() } });
  } catch {
    return res.status(500).json({ error: 'server' });
  }
}
