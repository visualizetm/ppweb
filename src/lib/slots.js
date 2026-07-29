import { sunTimes, lightWindow } from './sun';
import { location, rules, weeklyBlocks, blackoutDates } from '../data/availability';
import { zonedParts, zonedTime, zonedDateKey, zonedDay } from './tz';

/* ===========================================================================
   Slot generation.
   ---------------------------------------------------------------------------
   Turns the availability config into actual bookable times for a given date.

   The interesting part is that a working block can be defined RELATIVE TO THE
   SUN rather than to the clock: "the three hours before sunset on a Saturday"
   resolves to 5:34pm in December and 8:34pm in June, on its own, forever. That
   is the whole reason this file exists instead of a hardcoded list of times.
   =========================================================================== */

const MIN = 60000;

/* "15:00" means three in the afternoon WHERE THE SHOOT IS, not wherever the
   visitor happens to be sitting. Resolving this with setHours used the
   runtime's zone and handed a Californian a different working day. */
const atTime = (date, hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const p = zonedParts(date);
  return zonedTime(p.year, p.month, p.day, h, m);
};

/** Resolve one weekly block into a concrete {from, to} window on `date`. */
function resolveBlock(block, date) {
  if (block.type === 'fixed') {
    return { from: atTime(date, block.start), to: atTime(date, block.end) };
  }

  const t = sunTimes(date, location.latitude, location.longitude);
  if (!t || !t.sunrise || !t.sunset) return null;

  if (block.type === 'golden-evening') {
    return {
      from: new Date(t.sunset.valueOf() - (block.beforeSunsetMinutes || 120) * MIN),
      to: t.sunset,
    };
  }

  if (block.type === 'golden-morning') {
    return {
      from: t.sunrise,
      to: new Date(t.sunrise.valueOf() + (block.afterSunriseMinutes || 120) * MIN),
    };
  }

  return null;
}

/** Is this date open at all — lead time, horizon, blackouts, any blocks? */
export function isDateSelectable(date, today = new Date()) {
  /* Compared as calendar days on the shoot's clock. */
  const startKey = zonedDateKey(today);
  const dKey = zonedDateKey(date);
  const asDay = (key) => {
    const [y, m, dd] = key.split('-').map(Number);
    return Date.UTC(y, m - 1, dd);
  };
  const daysOut = Math.round((asDay(dKey) - asDay(startKey)) / 86400000);
  if (daysOut < rules.leadTimeDays) {
    return { ok: false, reason: `Needs at least ${rules.leadTimeDays} days' notice` };
  }
  if (daysOut > rules.maxAdvanceDays) {
    return { ok: false, reason: 'Too far ahead to book yet' };
  }
  if (blackoutDates.includes(dKey)) {
    return { ok: false, reason: 'Not shooting that day' };
  }
  if (!weeklyBlocks.some((b) => b.day === zonedDay(date))) {
    return { ok: false, reason: 'Not a shooting day' };
  }
  return { ok: true, reason: null };
}

/**
 * Every start time available on `date` for a shoot of `durationMinutes`.
 * `taken` is the list of already-booked slots from the data layer.
 */
export function slotsForDate(date, durationMinutes = 90, taken = []) {
  const check = isDateSelectable(date);
  if (!check.ok) return [];

  const day = zonedDay(date);
  const blocks = weeklyBlocks
    .filter((b) => b.day === day)
    .map((b) => resolveBlock(b, date))
    .filter(Boolean);

  const step = rules.slotIntervalMinutes * MIN;
  const need = durationMinutes * MIN;
  const buffer = rules.bufferMinutes * MIN;

  const busy = taken.map((t) => {
    const from = new Date(t.at).valueOf();
    return { from, to: from + (t.durationMinutes || 90) * MIN + buffer };
  });

  const out = [];
  const seen = new Set();

  for (const block of blocks) {
    /* Round the block's start up to the next interval boundary so slots land
       on tidy times rather than on whatever minute sunset happens to be. */
    const first = Math.ceil(block.from.valueOf() / step) * step;

    for (let t = first; t + need <= block.to.valueOf() + need; t += step) {
      /* A slot may START inside the block; it is allowed to run past the end,
         because he already says he will run over if the shot needs it. */
      if (t > block.to.valueOf()) break;
      if (seen.has(t)) continue;
      seen.add(t);

      const at = new Date(t);
      if (busy.some((b) => t < b.to && t + need > b.from)) continue;

      const win = lightWindow(at, location.latitude, location.longitude);
      out.push({
        at,
        iso: at.toISOString(),
        lightWindow: win,
        recommended:
          rules.recommendGoldenHour &&
          (win === 'golden-morning' || win === 'golden-evening' || win === 'blue'),
      });
    }
  }

  return out.sort((a, b) => a.at - b.at);
}

/** The next `count` selectable dates from today, for the calendar strip. */
export function selectableDates(count = 60, today = new Date()) {
  const out = [];
  const cursor = new Date(today);
  cursor.setHours(12, 0, 0, 0);

  for (let i = 0; i <= rules.maxAdvanceDays && out.length < count; i += 1) {
    const d = new Date(cursor);
    d.setDate(d.getDate() + i);
    const check = isDateSelectable(d, today);
    out.push({ date: d, iso: zonedDateKey(d), ...check });
  }
  return out;
}

/** Rough density for the calendar: how many slots a date can offer. */
export function slotCountForDate(date, durationMinutes = 90) {
  return slotsForDate(date, durationMinutes).length;
}
