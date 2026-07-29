import { bookings } from './_lib/mongo';
import { sendEmail, bookingEmail } from './_lib/notify';

const TYPES = ['solo','duo','group','event','portrait','wedding','editing'];
const clean = (v, max = 400) => String(v ?? '').slice(0, max).trim();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const b = req.body || {};
  const name = clean(b.contact?.name, 120);
  const email = clean(b.contact?.email, 200);

  if (!name) return res.status(400).json({ error: 'name_required', message: 'A name is required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: 'email_invalid', message: 'That email address is not valid.' });
  }

  const doc = {
    ref: `PP-${Date.now().toString().slice(-6)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    packageSlug: TYPES.includes(b.packageSlug) ? b.packageSlug : null,
    tierId: clean(b.tierId, 60) || null,
    tierName: clean(b.tierName, 60) || null,
    title: clean(b.title, 160) || 'New booking',
    vehicle: b.vehicle ? {
      year: clean(b.vehicle.year, 8), make: clean(b.vehicle.make, 40),
      model: clean(b.vehicle.model, 60), color: clean(b.vehicle.color, 40),
    } : null,
    vehicleCount: Math.min(40, Math.max(1, Number(b.vehicleCount) || 1)),
    peopleCount: Math.min(60, Math.max(0, Number(b.peopleCount) || 0)),
    locationPref: clean(b.locationPref, 300),
    shotNotes: clean(b.shotNotes, 2000),
    scheduledAt: b.scheduledAt ? new Date(b.scheduledAt) : null,
    durationMinutes: Number(b.durationMinutes) || null,
    flexible: Boolean(b.flexible),
    contact: { name, email, phone: clean(b.contact?.phone, 40), source: clean(b.contact?.source, 60) },
    status: 'new',
    read: false,
    notes: '',
    messageCount: 1,
    invoices: [],
  };

  try {
    const col = await bookings();
    const { insertedId } = await col.insertOne(doc);

    /* Notification failure must never fail the submission. */
    await Promise.allSettled([sendEmail(bookingEmail(doc))]);

    return res.status(200).json({ ok: true, booking: { ...doc, id: String(insertedId) } });
  } catch (err) {
    return res.status(500).json({ error: 'server', message: 'Could not save that booking.' });
  }
}
