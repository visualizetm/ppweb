/* ===========================================================================
   Solar times.
   ---------------------------------------------------------------------------
   Golden hour is not a fixed clock time. In Philadelphia, sunset moves by more
   than three hours across the year — hardcoding "6pm is golden hour" would be
   right in March and badly wrong in December, and this is a business where the
   light IS the product.

   So the booking calendar computes real sunrise, sunset and golden-hour
   boundaries for the selected date. No API, no key, no network call: this is
   the standard NOAA sunrise equation, which is accurate to well under a minute
   at this latitude, and it runs client-side in microseconds.

   Reference: the sunrise equation, https://en.wikipedia.org/wiki/Sunrise_equation
   =========================================================================== */

const RAD = Math.PI / 180;
const J2000 = 2451545.0;
const MS_PER_DAY = 86400000;
const JULIAN_EPOCH_OFFSET = 2440587.5;

/* Sun altitude, in degrees, that defines each boundary.
   -0.833 accounts for atmospheric refraction plus the sun's angular radius,
   which is why sunrise is "when the top edge appears", not the centre. */
const ALT_HORIZON = -0.833;
const ALT_GOLDEN = 6; // sun 6 degrees up — the usual end of usable golden light
const ALT_BLUE = -4; // sun 4 degrees down — blue hour

const toJulian = (date) => date.valueOf() / MS_PER_DAY + JULIAN_EPOCH_OFFSET;
const fromJulian = (j) => new Date((j - JULIAN_EPOCH_OFFSET) * MS_PER_DAY);

/**
 * Solar times for a given date and position.
 *
 * @param {Date}   date - any instant on the local day in question
 * @param {number} lat  - latitude, degrees north positive
 * @param {number} lon  - longitude, degrees east positive (Philadelphia is negative)
 * @returns {{sunrise: Date, sunset: Date, solarNoon: Date,
 *            goldenMorningEnd: Date, goldenEveningStart: Date,
 *            blueMorningStart: Date, blueEveningEnd: Date} | null}
 *          null at latitudes/dates where the sun never reaches the angle
 *          (polar day or night — cannot happen in Pennsylvania, but the guard
 *          means this function never returns an Invalid Date).
 */
export function sunTimes(date, lat, lon) {
  const lw = -lon; // west-positive longitude, as the equation expects
  const phi = lat * RAD;

  /* Normalise to midday on the date's LOCAL calendar day. The caller passes a
     Date that may sit anywhere in that day — including instants that fall on a
     different UTC day — and picking the wrong solar day would return yesterday's
     sunset. Anchoring to 12:00 UTC keeps the whole local day inside one solar
     day for any longitude in the Americas. */
  const anchored = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)
  );

  /* Days since J2000, corrected for longitude. Solar noon happens LATER in UTC
     the further west you are — Philadelphia at 75.17W runs about 5 hours behind
     Greenwich — so the correction is +lw/360 on the transit and -lw/360 when
     picking which solar day we are on. */
  const n = Math.round(toJulian(anchored) - J2000 - 0.0009 - lw / 360);
  const jStar = J2000 + 0.0009 + lw / 360 + n;

  // Solar mean anomaly.
  const M = (357.5291 + 0.98560028 * (jStar - J2000)) % 360;
  const Mrad = M * RAD;

  // Equation of the centre, and the ecliptic longitude.
  const C = 1.9148 * Math.sin(Mrad) + 0.02 * Math.sin(2 * Mrad) + 0.0003 * Math.sin(3 * Mrad);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const lambdaRad = lambda * RAD;

  // Solar transit (local solar noon) and declination.
  const jTransit =
    jStar + 0.0053 * Math.sin(Mrad) - 0.0069 * Math.sin(2 * lambdaRad);
  const delta = Math.asin(Math.sin(lambdaRad) * Math.sin(23.44 * RAD));

  /* Hour angle: how far, in degrees of rotation, the sun sits from the meridian
     when it is at altitude `alt`. Returns null if it never gets there. */
  const hourAngle = (alt) => {
    const cosOmega =
      (Math.sin(alt * RAD) - Math.sin(phi) * Math.sin(delta)) /
      (Math.cos(phi) * Math.cos(delta));
    if (cosOmega > 1 || cosOmega < -1) return null;
    return Math.acos(cosOmega) / RAD;
  };

  const omegaHorizon = hourAngle(ALT_HORIZON);
  if (omegaHorizon === null) return null;

  const omegaGolden = hourAngle(ALT_GOLDEN);
  const omegaBlue = hourAngle(ALT_BLUE);

  const before = (omega) => (omega === null ? null : fromJulian(jTransit - omega / 360));
  const after = (omega) => (omega === null ? null : fromJulian(jTransit + omega / 360));

  return {
    sunrise: before(omegaHorizon),
    sunset: after(omegaHorizon),
    solarNoon: fromJulian(jTransit),
    goldenMorningEnd: before(omegaGolden),
    goldenEveningStart: after(omegaGolden),
    blueMorningStart: before(omegaBlue),
    blueEveningEnd: after(omegaBlue),
  };
}

/**
 * Classify a time of day against the sun. Drives the "recommended" badge and
 * the explanation text on the calendar step.
 *
 * @returns {'golden-morning'|'golden-evening'|'blue'|'daylight'|'dark'}
 */
export function lightWindow(when, lat, lon) {
  const t = sunTimes(when, lat, lon);
  if (!t) return 'daylight';

  const ms = when.valueOf();
  const at = (d) => (d ? d.valueOf() : null);

  if (at(t.sunrise) !== null && at(t.goldenMorningEnd) !== null) {
    if (ms >= at(t.sunrise) && ms <= at(t.goldenMorningEnd)) return 'golden-morning';
  }
  if (at(t.goldenEveningStart) !== null && at(t.sunset) !== null) {
    if (ms >= at(t.goldenEveningStart) && ms <= at(t.sunset)) return 'golden-evening';
  }
  if (at(t.blueMorningStart) !== null && at(t.sunrise) !== null) {
    if (ms >= at(t.blueMorningStart) && ms < at(t.sunrise)) return 'blue';
  }
  if (at(t.sunset) !== null && at(t.blueEveningEnd) !== null) {
    if (ms > at(t.sunset) && ms <= at(t.blueEveningEnd)) return 'blue';
  }
  if (at(t.sunrise) !== null && at(t.sunset) !== null) {
    if (ms > at(t.sunrise) && ms < at(t.sunset)) return 'daylight';
  }
  return 'dark';
}

/** Plain-language reason shown next to a recommended slot. */
export const LIGHT_LABELS = {
  'golden-morning': {
    label: 'Golden hour',
    short: 'Golden',
    why: 'Low, warm, directional light right after sunrise. Long shadows, clean reflections down the bodyline, and almost nobody else around.',
  },
  'golden-evening': {
    label: 'Golden hour',
    short: 'Golden',
    why: 'The hour before sunset. This is the light most of the portfolio was shot in — it wraps around the car instead of flattening it.',
  },
  blue: {
    label: 'Blue hour',
    short: 'Blue',
    why: 'The window just outside sunrise or sunset. Deep blue sky against warm streetlight and headlights — this is where the night shots come from.',
  },
  daylight: {
    label: 'Daylight',
    short: 'Day',
    why: 'Workable, and the right call for events and group shoots where everyone needs to see what they are doing. Harsher on a single car than golden hour.',
  },
  dark: {
    label: 'After dark',
    short: 'Night',
    why: 'Full dark. Good for city and garage work where the light is artificial anyway.',
  },
};

export default sunTimes;
