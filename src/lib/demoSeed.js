/* ===========================================================================
   Demo seed data.
   ---------------------------------------------------------------------------
   EVERY PERSON IN THIS FILE IS FICTIONAL. The names are invented, the email
   addresses are on example.com (a reserved domain that cannot receive mail),
   and the phone numbers are all in the 555-01xx range, which is reserved for
   fiction and cannot be dialled. Nothing here is a real customer, a real
   review, or a real testimonial.

   The vehicles are real models, because a demo seeded with made-up cars would
   read as fake to the one person who matters — a car photographer. The people
   driving them are not.

   Dates are generated relative to whenever the demo is opened, so the dashboard
   always shows a live-looking spread of the last six weeks and the coming
   fortnight rather than a stale window around a hardcoded date.
   =========================================================================== */

import { pricing } from '../data/site';

const DAY = 86400000;
const HOUR = 3600000;

/* Deterministic pseudo-random so the seed is identical on every load within a
   session — a demo where the numbers jump on refresh looks broken. */
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const at = (base, days, hour, minute = 0) => {
  const d = new Date(base + days * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

/* --------------------------------------------------------------------------
   The cast. Fictional people, real cars.
   -------------------------------------------------------------------------- */
const PEOPLE = [
  { name: 'Casey Moreno',      email: 'casey.moreno@example.com',    phone: '(215) 555-0142' },
  { name: 'Devon Ashford',     email: 'd.ashford@example.com',       phone: '(610) 555-0177' },
  { name: 'Priya Raman',       email: 'priya.raman@example.com',     phone: '(484) 555-0119' },
  { name: 'Marcus Vollmer',    email: 'm.vollmer@example.com',       phone: '(267) 555-0163' },
  { name: 'Simone Okafor',     email: 'simone.okafor@example.com',   phone: '(610) 555-0128' },
  { name: 'Tobias Lindqvist',  email: 't.lindqvist@example.com',     phone: '(215) 555-0194' },
  { name: 'Renata Salas',      email: 'renata.salas@example.com',    phone: '(484) 555-0151' },
  { name: 'Emil Brackett',     email: 'emil.brackett@example.com',   phone: '(267) 555-0186' },
  { name: 'Nadia Petrov',      email: 'nadia.petrov@example.com',    phone: '(610) 555-0135' },
  { name: 'Wes Calloway',      email: 'wes.calloway@example.com',    phone: '(215) 555-0108' },
  { name: 'Ingrid Sandoval',   email: 'i.sandoval@example.com',      phone: '(484) 555-0172' },
  { name: 'Julian Ferreira',   email: 'j.ferreira@example.com',      phone: '(267) 555-0147' },
  { name: 'Rowan Delacroix',   email: 'rowan.d@example.com',         phone: '(610) 555-0190' },
];

const SOURCES = ['Instagram', 'A friend', 'Cars & Coffee', 'Google', 'Instagram', 'A friend'];

/* Builds one booking. Kept verbose rather than clever — this file is read by a
   human deciding whether the demo looks like their business. */
function booking(o) {
  return {
    id: o.id,
    ref: o.ref,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt || o.createdAt,
    path: o.path, // 'consultation' | 'session'
    packageSlug: o.packageSlug,
    tierId: o.tierId || null,
    tierName: o.tierName || null,
    title: o.title,
    addons: o.addons || [],
    vehicle: o.vehicle || null,
    vehicleCount: o.vehicleCount ?? 1,
    peopleCount: o.peopleCount ?? 0,
    locationPref: o.locationPref || '',
    shotNotes: o.shotNotes || '',
    scheduledAt: o.scheduledAt || null,
    durationMinutes: o.durationMinutes || null,
    lightWindow: o.lightWindow || null,
    contact: {
      name: o.name,
      email: o.email,
      phone: o.phone,
      source: o.source,
    },
    status: o.status,
    read: o.read ?? true,
    notes: o.notes || '',
    messageCount: o.messageCount ?? 0,
    attachmentCount: o.attachmentCount ?? 0,
    pricing: o.pricing || null,
    payment: o.payment || null,
  };
}

const paid = (cents, days, base, brand = 'visa', last4 = '4242') => ({
  status: 'succeeded',
  intentId: `pi_demo_${Math.abs(cents * 7 + days * 13)
    .toString(36)
    .padStart(8, '0')}`,
  amountCents: cents,
  brand,
  last4,
  paidAt: at(base, days, 14, 12),
  receiptRef: `rcpt_demo_${Math.abs(days * 977 + cents)
    .toString(36)
    .slice(0, 10)}`,
});

const money = (subtotal, travel = 0) => ({
  subtotalCents: subtotal,
  travelCents: travel,
  totalCents: subtotal + travel,
  depositCents: pricing.depositCents,
});

/**
 * Build the full seed. Called fresh on reset so the relative dates re-anchor.
 */
export function buildSeed(now = Date.now()) {
  const rnd = seededRandom(20251011);
  const p = (i) => PEOPLE[i % PEOPLE.length];
  const src = (i) => SOURCES[Math.floor(rnd() * SOURCES.length) % SOURCES.length] || SOURCES[i % SOURCES.length];

  const items = [
    /* --- Upcoming, deposit paid, everything in order --------------------- */
    booking({
      id: 'bk_demo_01',
      ref: 'PP-2418',
      ...p(0),
      source: src(0),
      createdAt: at(now, -9, 20, 14),
      path: 'session',
      packageSlug: 'solo',
      tierId: 'solo-extended',
      tierName: 'Extended',
      title: 'Porsche 911 GT3 — Golden Hour Solo',
      vehicle: { year: 2018, make: 'Porsche', model: '911 GT3', color: 'Guards Red' },
      addons: [{ id: 'rolling-shots', qty: 1 }],
      locationPref: 'Back roads west of Paoli',
      shotNotes: 'Rolling shots are the priority. Static can be quick.',
      scheduledAt: at(now, 2, 17, 45),
      durationMinutes: 150,
      lightWindow: 'golden-evening',
      status: 'deposit-paid',
      read: true,
      messageCount: 4,
      attachmentCount: 2,
      pricing: money(42500 + 15000),
      payment: paid(pricing.depositCents, -9, now),
    }),

    booking({
      id: 'bk_demo_02',
      ref: 'PP-2417',
      ...p(1),
      source: src(1),
      createdAt: at(now, -6, 9, 5),
      path: 'session',
      packageSlug: 'duo',
      tierId: 'duo-essential',
      tierName: 'Essential',
      title: 'M2 & Supra — Duo, Manayunk',
      vehicle: { year: 2021, make: 'BMW', model: 'M2 Competition', color: 'Alpine White' },
      vehicleCount: 2,
      peopleCount: 2,
      locationPref: 'Manayunk, near the towpath',
      scheduledAt: at(now, 5, 7, 15),
      durationMinutes: 120,
      lightWindow: 'golden-morning',
      status: 'scheduled',
      read: true,
      messageCount: 2,
      attachmentCount: 1,
      pricing: money(45000),
      payment: paid(pricing.depositCents, -6, now, 'mastercard', '5454'),
    }),

    /* --- Awaiting deposit — the number the dashboard stat card counts ----- */
    booking({
      id: 'bk_demo_03',
      ref: 'PP-2416',
      ...p(2),
      source: src(2),
      createdAt: at(now, -3, 21, 40),
      path: 'session',
      packageSlug: 'solo',
      tierId: 'solo-essential',
      tierName: 'Essential',
      title: 'Civic Type R — Solo, City Night',
      vehicle: { year: 2023, make: 'Honda', model: 'Civic Type R', color: 'Boost Blue' },
      locationPref: 'Center City parking structure',
      shotNotes: 'Wants the night look from the rain gallery.',
      scheduledAt: at(now, 9, 18, 30),
      durationMinutes: 90,
      lightWindow: 'blue',
      status: 'quoted',
      read: false,
      messageCount: 1,
      pricing: money(27500, pricing.travel.feeCents),
      payment: { status: 'requires_payment', intentId: null, amountCents: pricing.depositCents },
    }),

    booking({
      id: 'bk_demo_04',
      ref: 'PP-2415',
      ...p(3),
      source: src(3),
      createdAt: at(now, -2, 12, 22),
      path: 'consultation',
      packageSlug: 'group',
      title: 'Club group shoot — 8 cars',
      vehicleCount: 8,
      peopleCount: 10,
      locationPref: 'Somewhere with space to stage 8 cars',
      shotNotes:
        'Running a small club meet and want proper coverage rather than phone photos. Flexible on date.',
      status: 'inquiry',
      read: false,
      messageCount: 1,
      pricing: null,
      payment: null,
    }),

    booking({
      id: 'bk_demo_05',
      ref: 'PP-2414',
      ...p(4),
      source: src(4),
      createdAt: at(now, -1, 19, 8),
      path: 'consultation',
      packageSlug: 'wedding',
      title: 'Wedding enquiry — next September',
      peopleCount: 2,
      shotNotes:
        'Getting married next September. Saw the car work and want that same feel for the day, plus photos with the car we are leaving in.',
      status: 'inquiry',
      read: false,
      messageCount: 1,
      pricing: null,
      payment: null,
    }),

    /* --- Editing-only, no shoot date ------------------------------------- */
    booking({
      id: 'bk_demo_06',
      ref: 'PP-2413',
      ...p(5),
      source: src(5),
      createdAt: at(now, -4, 15, 51),
      path: 'session',
      packageSlug: 'editing',
      tierId: 'editing-set',
      tierName: 'Set of 10',
      title: 'Editing set — 10 images, GR86',
      vehicle: { year: 2022, make: 'Toyota', model: 'GR86', color: 'Track bRed' },
      shotNotes: 'Shot these myself at a meet, they need help. Ten of them.',
      status: 'deposit-paid',
      read: true,
      messageCount: 6,
      attachmentCount: 10,
      notes:
        'Files came through fine. Underexposed but recoverable — the raws have plenty in the shadows.',
      pricing: money(27500),
      payment: paid(pricing.depositCents, -4, now),
    }),

    /* --- Recently completed, delivered ----------------------------------- */
    booking({
      id: 'bk_demo_07',
      ref: 'PP-2411',
      ...p(6),
      source: src(6),
      createdAt: at(now, -21, 10, 12),
      updatedAt: at(now, -8, 16, 30),
      path: 'session',
      packageSlug: 'duo',
      tierId: 'duo-extended',
      tierName: 'Extended',
      title: 'Mustang GT & Camaro SS — Duo',
      vehicle: { year: 2020, make: 'Ford', model: 'Mustang GT', color: 'Shadow Black' },
      vehicleCount: 2,
      peopleCount: 2,
      scheduledAt: at(now, -12, 17, 0),
      durationMinutes: 180,
      lightWindow: 'golden-evening',
      status: 'delivered',
      read: true,
      messageCount: 9,
      attachmentCount: 4,
      notes: 'Delivered 61 frames. Both owners happy, asked about doing it again in spring.',
      pricing: money(65000),
      payment: paid(pricing.depositCents, -21, now),
    }),

    booking({
      id: 'bk_demo_08',
      ref: 'PP-2409',
      ...p(7),
      source: src(0),
      createdAt: at(now, -26, 8, 44),
      updatedAt: at(now, -15, 11, 15),
      path: 'session',
      packageSlug: 'solo',
      tierId: 'solo-extended',
      tierName: 'Extended',
      title: 'Golf R — Solo, Two Locations',
      vehicle: { year: 2022, make: 'Volkswagen', model: 'Golf R', color: 'Lapiz Blue' },
      scheduledAt: at(now, -18, 7, 30),
      durationMinutes: 150,
      lightWindow: 'golden-morning',
      status: 'delivered',
      read: true,
      messageCount: 5,
      attachmentCount: 3,
      pricing: money(42500, pricing.travel.feeCents),
      payment: paid(pricing.depositCents, -26, now, 'amex', '0005'),
    }),

    /* --- Shot but not yet delivered — the editing queue ------------------- */
    booking({
      id: 'bk_demo_09',
      ref: 'PP-2412',
      ...p(8),
      source: src(1),
      createdAt: at(now, -17, 13, 3),
      updatedAt: at(now, -5, 9, 0),
      path: 'session',
      packageSlug: 'event',
      title: 'Cars & Coffee — October Meet',
      vehicleCount: 40,
      peopleCount: 60,
      scheduledAt: at(now, -5, 8, 0),
      durationMinutes: 240,
      lightWindow: 'daylight',
      status: 'shot',
      read: true,
      messageCount: 3,
      attachmentCount: 1,
      notes: 'Big turnout. Roughly 400 frames to work through — organiser wants a set for socials first.',
      pricing: money(60000),
      payment: paid(pricing.depositCents, -17, now),
    }),

    booking({
      id: 'bk_demo_10',
      ref: 'PP-2410',
      ...p(9),
      source: src(2),
      createdAt: at(now, -24, 18, 27),
      updatedAt: at(now, -10, 12, 40),
      path: 'session',
      packageSlug: 'portrait',
      tierId: 'portrait-extended',
      tierName: 'Extended',
      title: 'Portraits with the E30',
      vehicle: { year: 1989, make: 'BMW', model: '325i', color: 'Diamond Black' },
      peopleCount: 2,
      scheduledAt: at(now, -10, 16, 45),
      durationMinutes: 120,
      lightWindow: 'golden-evening',
      status: 'shot',
      read: true,
      messageCount: 4,
      pricing: money(37500),
      payment: paid(pricing.depositCents, -24, now),
    }),

    /* --- Consultation booked, not yet quoted ----------------------------- */
    booking({
      id: 'bk_demo_11',
      ref: 'PP-2419',
      ...p(10),
      source: src(3),
      createdAt: at(now, -1, 8, 15),
      path: 'consultation',
      packageSlug: 'event',
      title: 'Consultation — spring meet series',
      vehicleCount: 25,
      shotNotes: 'Organising a three-event series next spring, want the same photographer across all of them.',
      scheduledAt: at(now, 1, 19, 0),
      durationMinutes: 30,
      status: 'consultation-booked',
      read: true,
      messageCount: 2,
      pricing: null,
      payment: null,
    }),

    booking({
      id: 'bk_demo_12',
      ref: 'PP-2420',
      ...p(11),
      source: src(4),
      createdAt: at(now, 0, 7, 55),
      path: 'consultation',
      packageSlug: 'solo',
      title: 'Consultation — first-time shoot',
      vehicle: { year: 2024, make: 'Subaru', model: 'WRX tS', color: 'Solar Orange' },
      shotNotes: 'Never done this before and not sure what to ask for. Just want good photos of the car.',
      scheduledAt: at(now, 3, 18, 30),
      durationMinutes: 30,
      status: 'consultation-booked',
      read: false,
      messageCount: 1,
      pricing: null,
      payment: null,
    }),

    /* --- One cancelled, so the pipeline has a terminal branch ------------- */
    booking({
      id: 'bk_demo_13',
      ref: 'PP-2408',
      ...p(12),
      source: src(5),
      createdAt: at(now, -31, 14, 9),
      updatedAt: at(now, -27, 10, 5),
      path: 'session',
      packageSlug: 'solo',
      tierId: 'solo-essential',
      tierName: 'Essential',
      title: 'Miata — Solo (cancelled)',
      vehicle: { year: 2019, make: 'Mazda', model: 'MX-5 Miata', color: 'Machine Grey' },
      scheduledAt: at(now, -22, 17, 30),
      durationMinutes: 90,
      lightWindow: 'golden-evening',
      status: 'cancelled',
      read: true,
      messageCount: 3,
      notes: 'Sold the car before the shoot. Said he would be back once the replacement lands.',
      pricing: money(27500),
      payment: paid(pricing.depositCents, -31, now),
    }),

    booking({
      id: 'bk_demo_14',
      ref: 'PP-2407',
      ...p(0),
      name: 'Yuki Tanaka-Brooks',
      email: 'y.tanakabrooks@example.com',
      phone: '(215) 555-0166',
      source: src(6),
      createdAt: at(now, -38, 11, 30),
      updatedAt: at(now, -30, 15, 20),
      path: 'session',
      packageSlug: 'solo',
      tierId: 'solo-extended',
      tierName: 'Extended',
      title: 'GR Corolla — Solo, Wet Roads',
      vehicle: { year: 2023, make: 'Toyota', model: 'GR Corolla', color: 'Heavy Metal' },
      scheduledAt: at(now, -30, 18, 15),
      durationMinutes: 150,
      lightWindow: 'blue',
      status: 'delivered',
      read: true,
      messageCount: 7,
      attachmentCount: 5,
      pricing: money(42500),
      payment: paid(pricing.depositCents, -38, now),
    }),
  ];

  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/* Fictional enquiry messages for the dashboard's "Recent inquiries" rail. */
export function buildInquiryFeed(items) {
  return items
    .filter((b) => b.shotNotes)
    .slice(0, 6)
    .map((b) => ({
      id: `msg_${b.id}`,
      bookingId: b.id,
      name: b.contact.name,
      message: b.shotNotes,
      at: b.createdAt,
      read: b.read,
    }));
}

export default buildSeed;
