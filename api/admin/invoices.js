import { ObjectId } from 'mongodb';
import { bookings, invoices } from '../_lib/mongo';
import { requireAdmin } from '../_lib/auth';

/* PRODUCTION NOTE
   This writes an invoice record and returns it. The Stripe call belongs here:
   create a Stripe Invoice (or Payment Link) for the same line items, store the
   returned id and hosted URL on the document, and hand that URL back instead of
   an encoded token. See DEMO-TO-PRODUCTION.md section 4. */

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const col = await invoices();

  if (req.method === 'GET') {
    const items = await col.find({}).sort({ issuedAt: -1 }).limit(200).toArray();
    return res.status(200).json({ ok: true, items: items.map((i) => ({ ...i, id: String(i._id) })) });
  }

  if (req.method === 'POST') {
    const { bookingId, lines, kind = 'deposit', dueDate, title } = req.body || {};
    if (!bookingId || !Array.isArray(lines) || !lines.length) {
      return res.status(400).json({ error: 'bad_request' });
    }

    const bCol = await bookings();
    const booking = await bCol.findOne({ _id: new ObjectId(bookingId) });
    if (!booking) return res.status(404).json({ error: 'not_found' });

    const totalCents = lines.reduce(
      (s, l) => s + Math.max(0, Number(l.amountCents) || 0) * Math.max(1, Number(l.quantity) || 1), 0
    );
    const count = await col.countDocuments({});

    const doc = {
      number: `INV-${2400 + count + 1}`,
      bookingId: String(booking._id),
      title: String(title || booking.title).slice(0, 160),
      customerName: booking.contact.name,
      customerEmail: booking.contact.email,
      lines: lines.map((l) => ({
        description: String(l.description).slice(0, 200),
        quantity: Math.max(1, Number(l.quantity) || 1),
        amountCents: Math.max(0, Number(l.amountCents) || 0),
      })),
      kind: ['deposit', 'balance', 'full'].includes(kind) ? kind : 'deposit',
      dueDate: dueDate ? new Date(dueDate) : null,
      totalCents,
      amountDueCents: totalCents,
      issuedAt: new Date(),
      viewedAt: null,
      paidAt: null,
      voidedAt: null,
    };

    const { insertedId } = await col.insertOne(doc);
    await bCol.updateOne({ _id: booking._id }, { $set: { status: 'quote sent', updatedAt: new Date() } });

    return res.status(200).json({ ok: true, invoice: { ...doc, id: String(insertedId) } });
  }

  if (req.method === 'PATCH') {
    const { id, void: isVoid } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id_required' });
    if (isVoid) await col.updateOne({ _id: new ObjectId(id) }, { $set: { voidedAt: new Date() } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'method_not_allowed' });
}
