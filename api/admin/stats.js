import { bookings, invoices } from '../_lib/mongo';
import { requireAdmin } from '../_lib/auth';

const DAY = 86400000;

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const col = await bookings();
  const invCol = await invoices();
  const now = Date.now();

  const all = await col.find({}).sort({ createdAt: -1 }).limit(500).toArray();
  const inWindow = (b, from, to) => {
    const t = new Date(b.createdAt).valueOf();
    return t >= now - to * DAY && t < now - from * DAY;
  };

  const completed = all.filter((b) => ['shot', 'delivered'].includes(b.status));
  const thisMonth = completed.filter((b) => inWindow(b, 0, 30)).length;
  const prevMonth = completed.filter((b) => inWindow(b, 30, 60)).length;
  const pct = (c, p) => (!p ? (c ? 100 : 0) : Math.round(((c - p) / p) * 100));

  const weekly = Array.from({ length: 8 }, (_, i) => {
    const w = 7 - i;
    return {
      weeksAgo: w,
      count: all.filter((b) => {
        const t = new Date(b.createdAt).valueOf();
        return t >= now - (w + 1) * 7 * DAY && t < now - w * 7 * DAY;
      }).length,
    };
  });

  const paid = await invCol.find({ paidAt: { $ne: null } }).toArray();
  const revenue = paid
    .filter((i) => new Date(i.paidAt).valueOf() >= now - 30 * DAY)
    .reduce((s, i) => s + (i.amountDueCents || 0), 0);

  const upcoming = all
    .filter((b) => b.scheduledAt && new Date(b.scheduledAt) > new Date() && b.status !== 'cancelled')
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    .map((b) => ({ ...b, id: String(b._id) }));

  return res.status(200).json({
    ok: true,
    stats: {
      completed: { value: thisMonth, delta: pct(thisMonth, prevMonth), series: weekly },
      conversion: { value: all.length ? Math.round((completed.length / all.length) * 100) : 0, delta: 0, series: weekly },
      awaitingDeposit: {
        value: all.filter((b) => b.status === 'quote sent').length,
        people: all.filter((b) => b.status === 'quote sent').map((b) => b.contact.name),
      },
      revenue: { value: revenue, delta: 0, series: weekly },
      unread: all.filter((b) => !b.read).length,
      pipeline: [],
      upcoming,
      inquiries: all.filter((b) => b.shotNotes).slice(0, 6).map((b) => ({
        id: String(b._id), bookingId: String(b._id), name: b.contact.name,
        message: b.shotNotes, at: b.createdAt, read: b.read,
      })),
      weekCapacity: { booked: upcoming.length, capacity: 10, open: Math.max(0, 10 - upcoming.length), items: upcoming.slice(0, 3) },
    },
  });
}
