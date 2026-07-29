/* ===========================================================================
   Timezone helpers.
   ---------------------------------------------------------------------------
   THE BUG THIS EXISTS TO FIX

   Shoots happen in Delaware County, Pennsylvania. The booking UI, though, runs
   in whatever timezone the visitor's browser is set to. Using the runtime's
   local time for slot generation produced three separate faults:

     1. A "12:00" fixed availability block resolved to noon in the VISITOR's
        zone, so someone booking from California was offered a completely
        different set of hours than someone in Philadelphia.
     2. Slot times were printed in the visitor's zone, so a 6:30pm golden-hour
        shoot displayed as 3:30pm to that same Californian.
     3. Near midnight UTC the solar calculation anchored to the wrong calendar
        DAY, so an 8pm slot got classified against the next day's sunset and
        came back "Night" when it was golden hour.

   Every time in this system is an instant. What varies is which wall clock we
   read it against, and for a booking system the answer is always the
   photographer's — the shoot happens where he is.

   No library. Intl already knows every zone's offset, including DST.
   =========================================================================== */

export const SHOOT_TZ = 'America/New_York';

const PARTS = ['year', 'month', 'day', 'hour', 'minute', 'second'];

/** The wall-clock parts of `instant` as read in `timeZone`. */
export function zonedParts(instant, timeZone = SHOOT_TZ) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const found = Object.fromEntries(
    dtf.formatToParts(instant).map((p) => [p.type, p.value])
  );

  const out = {};
  for (const key of PARTS) out[key] = Number(found[key]);
  /* Intl can report hour 24 for midnight in some engines. */
  if (out.hour === 24) out.hour = 0;
  return out;
}

/** Offset of `timeZone` from UTC at `instant`, in ms. Negative west of GMT. */
export function zoneOffsetMs(instant, timeZone = SHOOT_TZ) {
  const p = zonedParts(instant, timeZone);
  const asIfUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asIfUtc - instant.valueOf();
}

/**
 * The instant at which the wall clock in `timeZone` reads the given date and
 * time. This is the inverse of zonedParts.
 *
 * Solved iteratively because the offset depends on the instant we are trying
 * to find. Two passes settle every case including the DST changeover, where
 * the first guess can land an hour out.
 */
export function zonedTime(year, month, day, hour = 0, minute = 0, timeZone = SHOOT_TZ) {
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let ts = target;
  for (let i = 0; i < 2; i += 1) {
    ts = target - zoneOffsetMs(new Date(ts), timeZone);
  }
  return new Date(ts);
}

/** Midday in `timeZone` on the calendar day `instant` falls on there. Used to
    anchor the solar calculation to the right day regardless of runtime zone. */
export function zonedNoon(instant, timeZone = SHOOT_TZ) {
  const p = zonedParts(instant, timeZone);
  return zonedTime(p.year, p.month, p.day, 12, 0, timeZone);
}

/** YYYY-MM-DD as read in `timeZone`. Keys dates without UTC drift. */
export function zonedDateKey(instant, timeZone = SHOOT_TZ) {
  const p = zonedParts(instant, timeZone);
  const pad = (n) => String(n).padStart(2, '0');
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Day of week (0 = Sunday) as read in `timeZone`. */
export function zonedDay(instant, timeZone = SHOOT_TZ) {
  const p = zonedParts(instant, timeZone);
  return new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
}

/** Formats an instant on the SHOOT's clock, never the visitor's. */
export function shootTime(instant, opts = {}) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: SHOOT_TZ,
    ...opts,
  }).format(instant instanceof Date ? instant : new Date(instant));
}

export function shootDate(instant, opts = {}) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: SHOOT_TZ,
    ...opts,
  }).format(instant instanceof Date ? instant : new Date(instant));
}

/** True when the visitor is not on the shoot's clock — the UI says so, rather
    than silently showing times that will not match their own calendar. */
export function visitorIsElsewhere() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone !== SHOOT_TZ;
  } catch {
    return false;
  }
}

/** Short zone label for the current date, e.g. "EDT". */
export function shootZoneLabel(instant = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: SHOOT_TZ,
      timeZoneName: 'short',
    }).formatToParts(instant);
    return parts.find((p) => p.type === 'timeZoneName')?.value || 'ET';
  } catch {
    return 'ET';
  }
}
