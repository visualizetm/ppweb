# Availability

Controls which dates and times the booking calendar offers. Everything is data —
**changing your schedule never requires a code change.**

Everything currently in `index.js` is a **PLACEHOLDER**. It is a sensible guess
at how an automotive photographer's week runs, not your actual diary. Set it to
the truth and set `isPlaceholder` to `false`.

## Sun-relative blocks — the important idea

Most booking systems make you pick clock times. That does not work here, because
the light you shoot in moves through the year. In Philadelphia sunset swings from
about 4:35pm in December to about 8:35pm in June — four hours. A fixed "6pm
evening slot" would be an hour after dark in winter and two hours before golden
hour in summer.

So a block can be tied to the sun instead of the clock:

```js
{ day: 6, type: 'golden-evening', beforeSunsetMinutes: 180 }
```

That means: **on Saturdays, open the three hours leading up to sunset**, whenever
sunset happens to be that week. It moves on its own, forever, with no maintenance.

The site computes real sunrise and sunset for every date using the standard
astronomical formula (`src/lib/sun.js`). There is no weather API, no key, and no
network call — it is pure arithmetic and it is accurate to under a minute.

## Block types

| Type | Fields | What it means |
|---|---|---|
| `fixed` | `start`, `end` (24h `'15:00'`) | Plain clock times, same all year. |
| `golden-evening` | `beforeSunsetMinutes` | Opens that many minutes before sunset, runs to sunset. |
| `golden-morning` | `afterSunriseMinutes` | Opens at sunrise, runs for that many minutes. |

`day` is `0` for Sunday through `6` for Saturday. A day with no blocks is a day
off — Monday currently has none.

You can put several blocks on one day. Saturday has three: a morning golden-hour
window, a midday block for events and group shoots, and an evening golden-hour
window.

## Rules

| Setting | What it does |
|---|---|
| `leadTimeDays` | Shortest notice you will accept. `3` means nothing books inside three days. |
| `maxAdvanceDays` | How far ahead the calendar opens. |
| `bufferMinutes` | Gap left after a shoot before the next can start — packing up and driving. |
| `slotIntervalMinutes` | Spacing of the offered start times. `30` gives half-hourly. |
| `recommendGoldenHour` | `true` badges golden- and blue-hour slots as recommended and explains why. Set `false` to turn that off. |

## Blackout dates

Days with no availability at all, whatever the weekly blocks say:

```js
export const blackoutDates = [
  '2026-05-16',   // shooting a wedding
  '2026-07-04',
];
```

Always `YYYY-MM-DD`. The ones in there now are US public holidays as a starting
point — replace them with your actual commitments.

## What this is not

This is a **published availability** system, not a live calendar sync. It knows
the hours you are willing to work; it does not know what is already in your
Google Calendar.

In the demo, slots already taken by a seeded booking are removed automatically.
In production the same thing happens against the real bookings in the database.
Syncing against an external calendar (so a dentist appointment blocks a slot too)
is a separate piece of work — it is not built, and it is noted in
`DEMO-TO-PRODUCTION.md` as an option rather than pretended to exist.
