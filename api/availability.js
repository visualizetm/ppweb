import { bookings } from './_lib/mongo';

/* Public: which slots are already taken. Deliberately returns only times and
   durations — no names, no contact details. */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  try {
    const col = await bookings();
    const rows = await col
      .find({ scheduledAt: { $ne: null }, status: { $ne: 'cancelled' } })
      .project({ scheduledAt: 1, durationMinutes: 1 })
      .toArray();
    return res.status(200).json({
      ok: true,
      slots: rows.map((r) => ({ at: r.scheduledAt, durationMinutes: r.durationMinutes || 90 })),
    });
  } catch {
    return res.status(500).json({ error: 'server' });
  }
}
