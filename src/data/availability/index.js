/* ===========================================================================
   Availability
   ---------------------------------------------------------------------------
   Drives the calendar step of the booking wizard. Everything here is data —
   changing when Michael works never requires a code change.

   PLACEHOLDER: the weekly blocks, lead time and blackout dates below are
   assumptions. Michael needs to confirm them.
   =========================================================================== */

/* Where the shooting happens. Used to compute real sunrise/sunset and golden
   hour for every date on the calendar — see src/lib/sun.js. */
export const location = {
  label: 'Delaware County, PA',
  /* Media, the county seat, sits close to the geographic centre of Delaware
     County. Sun times vary by well under a minute across the whole county, so
     one point is plenty — this is not a per-shoot calculation. */
  latitude: 39.9168,
  longitude: -75.3877,
  timeZone: 'America/New_York',
};

export const rules = {
  /* Shortest notice he will take a booking on. PLACEHOLDER. */
  leadTimeDays: 3,
  /* How far ahead the calendar opens. PLACEHOLDER. */
  maxAdvanceDays: 120,
  /* Gap left between the end of one shoot and the start of the next, for
     packing up and driving. PLACEHOLDER. */
  bufferMinutes: 60,
  /* Granularity of the offered start times. */
  slotIntervalMinutes: 30,
  /* Slots whose light window is golden or blue get a "recommended" badge.
     Set to false to stop surfacing that entirely. */
  recommendGoldenHour: true,
};

/* ---------------------------------------------------------------------------
   Weekly working blocks. `day` is 0=Sunday through 6=Saturday.

   A block is either:
     {type: 'fixed',  start: '09:00', end: '17:00'}
       plain clock times, same all year.

     {type: 'golden-evening', beforeSunsetMinutes: 120}
       a window that MOVES with the sun — opens this many minutes before
       sunset and runs to sunset. In June that is around 6:30pm; in December
       it is around 2:40pm. This is the block that matters most for automotive
       work, which is why it is expressed relative to the sun rather than the
       clock.

     {type: 'golden-morning', afterSunriseMinutes: 120}
       the mirror image, from sunrise.
   --------------------------------------------------------------------------- */
export const weeklyBlocks = [
  // Sunday — PLACEHOLDER
  { day: 0, type: 'golden-morning', afterSunriseMinutes: 150 },
  { day: 0, type: 'golden-evening', beforeSunsetMinutes: 150 },

  // Monday — no shooting. PLACEHOLDER
  // Tuesday — PLACEHOLDER
  { day: 2, type: 'golden-evening', beforeSunsetMinutes: 120 },

  // Wednesday — PLACEHOLDER
  { day: 3, type: 'golden-evening', beforeSunsetMinutes: 120 },

  // Thursday — PLACEHOLDER
  { day: 4, type: 'golden-evening', beforeSunsetMinutes: 120 },

  // Friday — PLACEHOLDER
  { day: 5, type: 'fixed', start: '15:00', end: '21:00' },

  // Saturday — the busiest day. PLACEHOLDER
  { day: 6, type: 'golden-morning', afterSunriseMinutes: 180 },
  { day: 6, type: 'fixed', start: '12:00', end: '16:00' },
  { day: 6, type: 'golden-evening', beforeSunsetMinutes: 180 },
];

/* ---------------------------------------------------------------------------
   Blackout dates — days with no availability at all, regardless of the weekly
   blocks. ISO format, YYYY-MM-DD. Add holidays, trips, and days already booked
   for something that is not on the site.
   PLACEHOLDER: these are US holidays as a starting point, not Michael's diary.
   --------------------------------------------------------------------------- */
export const blackoutDates = [
  '2025-11-27', // Thanksgiving — PLACEHOLDER
  '2025-12-24', // PLACEHOLDER
  '2025-12-25', // PLACEHOLDER
  '2026-01-01', // PLACEHOLDER
  '2026-07-04', // PLACEHOLDER
  '2026-11-26', // PLACEHOLDER
  '2026-12-24', // PLACEHOLDER
  '2026-12-25', // PLACEHOLDER
];

/* Days that are open in principle but where a note should be shown. */
export const dateNotes = [];

export const isPlaceholder = true; // flip to false once Michael confirms

export default { location, rules, weeklyBlocks, blackoutDates, dateNotes };
