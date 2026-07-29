/* Both of these swallow their own errors on purpose. A notification failure
   must never fail a booking — the booking is written first, then these fire
   through Promise.allSettled. Losing an email is recoverable; losing a
   customer's enquiry is not. */

export async function sendEmail({ subject, body }) {
  const key = process.env.WEB3FORMS_NOTIFY_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return { ok: false, skipped: 'not configured' };

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_key: key, subject, from_name: 'Paps Productions', email: to, message: body }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

export const bookingEmail = (b) => ({
  subject: `New booking — ${b.title}`,
  body: [
    `${b.contact.name} <${b.contact.email}>${b.contact.phone ? ` · ${b.contact.phone}` : ''}`,
    `Shoot: ${b.packageSlug || '—'}`,
    b.vehicle ? `Car: ${[b.vehicle.year, b.vehicle.make, b.vehicle.model].filter(Boolean).join(' ')}` : null,
    `Where: ${b.locationPref || 'open'}`,
    `When: ${b.scheduledAt || (b.flexible ? 'flexible' : 'not set')}`,
    b.shotNotes ? `Notes: ${b.shotNotes}` : null,
  ].filter(Boolean).join('\n'),
});
