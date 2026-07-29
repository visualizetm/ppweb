import { ObjectId } from 'mongodb';
import { bookings } from '../_lib/mongo';
import { requireAdmin } from '../_lib/auth';

const STATUS = ['new','reviewing','quote sent','deposit paid','scheduled','shot','delivered','cancelled'];
const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const col = await bookings();

  if (req.method === 'GET') {
    const { search, status, packageSlug, unreadOnly, id } = req.query;
    if (id) {
      const one = await col.findOne({ _id: new ObjectId(id) });
      return one
        ? res.status(200).json({ ok: true, booking: { ...one, id: String(one._id) } })
        : res.status(404).json({ error: 'not_found' });
    }

    const q = {};
    if (status && status !== 'all') q.status = status;
    if (packageSlug && packageSlug !== 'all') q.packageSlug = packageSlug;
    if (unreadOnly === 'true') q.read = false;
    if (search) {
      /* Escaped before it becomes a regex — an unescaped "(" from a phone
         number would otherwise throw and the search box would look broken. */
      const re = new RegExp(escapeRe(search), 'i');
      q.$or = [
        { 'contact.name': re }, { 'contact.email': re }, { 'contact.phone': re },
        { title: re }, { ref: re }, { notes: re }, { shotNotes: re },
      ];
    }

    const items = await col.find(q).sort({ createdAt: -1 }).limit(200).toArray();
    const unread = await col.countDocuments({ read: false });

    return res.status(200).json({
      ok: true,
      items: items.map((b) => ({ ...b, id: String(b._id) })),
      total: items.length,
      unread,
    });
  }

  if (req.method === 'PATCH') {
    const { id, markAllRead, status, read, notes } = req.body || {};

    if (markAllRead) {
      await col.updateMany({ read: false }, { $set: { read: true } });
      return res.status(200).json({ ok: true });
    }
    if (!id) return res.status(400).json({ error: 'id_required' });

    /* Whitelist only. Never spread req.body into a $set. */
    const set = { updatedAt: new Date() };
    if (status !== undefined) {
      if (!STATUS.includes(status)) return res.status(400).json({ error: 'bad_status' });
      set.status = status;
    }
    if (read !== undefined) set.read = Boolean(read);
    if (notes !== undefined) set.notes = String(notes).slice(0, 4000);

    const updated = await col.findOneAndUpdate(
      { _id: new ObjectId(id) }, { $set: set }, { returnDocument: 'after' }
    );
    const doc = updated?.value || updated;
    return doc
      ? res.status(200).json({ ok: true, booking: { ...doc, id: String(doc._id) } })
      : res.status(404).json({ error: 'not_found' });
  }

  return res.status(405).json({ error: 'method_not_allowed' });
}
