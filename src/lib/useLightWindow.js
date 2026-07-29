import { useEffect, useMemo, useState } from 'react';
import { sunTimes, lightWindow, LIGHT_LABELS } from './sun';
import { location } from '../data/availability';

/* ===========================================================================
   Today's light, live.
   ---------------------------------------------------------------------------
   Wraps the solar maths in sun.js into the shape the hero needs: a set of
   segments to draw, where "now" sits inside them, and what happens next.

   Recomputes once a minute. Not more — nothing here changes faster than that,
   and a 60s interval is cheap enough to leave running.
   =========================================================================== */

const MIN = 60000;
/* The wedge spans from two hours before sunrise to two hours after sunset.
   A full 24h span would squeeze golden hour down to about 3% of the track and
   make the whole thing unreadable. Outside this range the needle pins to an
   end and the readout says so. */
const PAD_MS = 2 * 60 * MIN;

const pct = (value, start, end) =>
  Math.max(0, Math.min(100, ((value - start) / (end - start)) * 100));

export default function useLightWindow(when) {
  const [now, setNow] = useState(() => when || new Date());

  useEffect(() => {
    if (when) return undefined;
    const id = setInterval(() => setNow(new Date()), MIN);
    return () => clearInterval(id);
  }, [when]);

  return useMemo(() => {
    const t = sunTimes(now, location.latitude, location.longitude);
    if (!t || !t.sunrise || !t.sunset) return null;

    const ms = (d) => (d ? d.valueOf() : null);
    const start = ms(t.sunrise) - PAD_MS;
    const end = ms(t.sunset) + PAD_MS;

    /* Ordered, non-overlapping bands across the span. `tone` is a luminance
       step, not a hue — the wedge is achromatic by design (see LightWedge). */
    const raw = [
      { key: 'dark', from: start, to: ms(t.blueMorningStart), tone: 0 },
      { key: 'blue', from: ms(t.blueMorningStart), to: ms(t.sunrise), tone: 1 },
      { key: 'golden-morning', from: ms(t.sunrise), to: ms(t.goldenMorningEnd), tone: 3 },
      { key: 'daylight', from: ms(t.goldenMorningEnd), to: ms(t.goldenEveningStart), tone: 4 },
      { key: 'golden-evening', from: ms(t.goldenEveningStart), to: ms(t.sunset), tone: 3 },
      { key: 'blue', from: ms(t.sunset), to: ms(t.blueEveningEnd), tone: 1 },
      { key: 'dark', from: ms(t.blueEveningEnd), to: end, tone: 0 },
    ]
      .filter((s) => s.from != null && s.to != null && s.to > s.from)
      .map((s) => ({
        ...s,
        left: pct(s.from, start, end),
        width: pct(s.to, start, end) - pct(s.from, start, end),
      }));

    const current = lightWindow(now, location.latitude, location.longitude);

    /* Ticks worth labelling. Golden-hour boundaries are the ones that matter
       to a booking, so they are named rather than just marked. */
    /* Only sunrise and sunset get ticks. Golden-hour start sits within a few
       percent of sunset on the track, so labelling both collided into mush —
       the golden band is named under its own bracket instead. */
    const ticks = [
      { at: ms(t.sunrise), label: 'Sunrise' },
      { at: ms(t.sunset), label: 'Sunset' },
    ]
      .filter((x) => x.at != null)
      .map((x) => ({ ...x, left: pct(x.at, start, end), date: new Date(x.at) }));

    /* What happens next, for the readout. Ordered by time; first one still in
       the future wins. */
    const upcoming = [
      { at: ms(t.blueMorningStart), label: 'Blue hour starts' },
      { at: ms(t.sunrise), label: 'Sunrise' },
      { at: ms(t.goldenMorningEnd), label: 'Morning golden ends' },
      { at: ms(t.goldenEveningStart), label: 'Golden hour starts' },
      { at: ms(t.sunset), label: 'Sunset' },
      { at: ms(t.blueEveningEnd), label: 'Blue hour ends' },
    ]
      .filter((x) => x.at != null && x.at > now.valueOf())
      .sort((a, b) => a.at - b.at);

    const next = upcoming[0]
      ? {
          ...upcoming[0],
          date: new Date(upcoming[0].at),
          minutes: Math.round((upcoming[0].at - now.valueOf()) / MIN),
        }
      : null;

    /* How long the CURRENT window has left, when we are inside a good one. */
    const activeBand = raw.find(
      (s) => now.valueOf() >= s.from && now.valueOf() < s.to && s.key === current
    );
    const remaining = activeBand
      ? Math.round((activeBand.to - now.valueOf()) / MIN)
      : null;

    return {
      now,
      times: t,
      segments: raw,
      ticks,
      current,
      label: LIGHT_LABELS[current],
      next,
      remaining,
      nowLeft: pct(now.valueOf(), start, end),
      /* True when the needle is pinned at an edge rather than sitting inside
         the drawn span — the readout wording changes in that case. */
      offScale: now.valueOf() < start || now.valueOf() > end,
      place: location.label,
      timeZone: location.timeZone,
    };
  }, [now]);
}

/** "1h 12m" / "48m" — used by the readout and the calendar step. */
export const formatDuration = (minutes) => {
  if (minutes == null) return '';
  const m = Math.max(0, minutes);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
};
