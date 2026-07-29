import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ArrowLeft from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Check from '@untitled-ui/icons-react/build/esm/Check';
import CheckCircle from '@untitled-ui/icons-react/build/esm/CheckCircle';
import AlertCircle from '@untitled-ui/icons-react/build/esm/AlertCircle';
import Car01 from '@untitled-ui/icons-react/build/esm/Car01';
import Cube02 from '@untitled-ui/icons-react/build/esm/Cube02';
import Users01 from '@untitled-ui/icons-react/build/esm/Users01';
import CalendarHeart01 from '@untitled-ui/icons-react/build/esm/CalendarHeart01';
import User03 from '@untitled-ui/icons-react/build/esm/User03';
import Heart from '@untitled-ui/icons-react/build/esm/Heart';
import Image03 from '@untitled-ui/icons-react/build/esm/Image03';
import Loading01 from '@untitled-ui/icons-react/build/esm/Loading01';

import Seo from '../components/Seo';
import LightWedge from '../components/LightWedge';
import useLightWindow from '../lib/useLightWindow';
import { packages, getPackage } from '../data/packages';
import { site } from '../data/site';
import { submitBooking, getBookedSlots, isDemo } from '../lib/dataSource';
import { slotsForDate, selectableDates } from '../lib/slots';
import { LIGHT_LABELS } from '../lib/sun';
import { shootTime, shootDate, shootZoneLabel, visitorIsElsewhere, zonedParts } from '../lib/tz';

/* ===========================================================================
   Booking.
   ---------------------------------------------------------------------------
   NO PAYMENT HAPPENS HERE. The customer describes the shoot and sends it;
   Michael reviews it, builds a quote, and sends an invoice link afterwards.
   That mirrors how he actually works — every booking starts with a
   conversation — and it means nobody is asked for a card before they have
   spoken to him.

   A submitted booking lands in the admin as `new`. Nothing is charged and
   nothing is confirmed.

   Action names hold across the whole flow: the button says "Send booking" and
   the screen that follows says "Booking sent".
   =========================================================================== */

const ICONS = { Car01, Cube02, Users01, CalendarHeart01, User03, Heart, Image03 };

const STEPS = [
  { id: 'shoot', title: 'What you’re booking', sub: 'Pick the closest thing. We can change it later.' },
  { id: 'car', title: 'Your car', sub: 'As much or as little as you know. None of this is required.' },
  { id: 'when', title: 'Where and when', sub: 'Light is the real variable. Recommended times are marked.' },
  { id: 'wants', title: 'What you’re after', sub: 'Shots you have in mind, or a reference you have seen.' },
  { id: 'you', title: 'Your details', sub: 'So I can get back to you.' },
  { id: 'review', title: 'Review and send', sub: 'Nothing is charged. I’ll follow up with a quote.' },
];

/* Common asks, offered as chips so nobody has to write an essay. */
const WANT_CHIPS = [
  { id: 'rolling', label: 'Rolling shots' },
  { id: 'detail', label: 'Detail work' },
  { id: 'night', label: 'Night' },
  { id: 'rain', label: 'Rain / wet' },
  { id: 'interior', label: 'Interior' },
  { id: 'with-me', label: 'Me in the shots' },
  { id: 'social', label: 'For social' },
  { id: 'prints', label: 'For prints' },
];

const SOURCES = ['Instagram', 'A friend', 'At a meet', 'Google', 'Somewhere else'];

const EMPTY = {
  packageSlug: '',
  tierId: '',
  vehicleYear: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleColor: '',
  vehicleCount: 1,
  peopleCount: 0,
  locationPref: '',
  flexible: false,
  dateIso: '',
  slotIso: '',
  wants: [],
  notes: '',
  name: '',
  email: '',
  phone: '',
  source: '',
};

/* Pure. Returns an errors object; empty means the step may advance. */
export function validateStep(stepId, form) {
  const errors = {};

  if (stepId === 'shoot') {
    if (!form.packageSlug) errors.packageSlug = 'Pick what you’re booking.';
  }

  if (stepId === 'when') {
    /* A date is not required — "I'm flexible" is a first-class answer here,
       because he would rather talk it through than lose someone to a required
       field. But you cannot both pick nothing AND not say you are flexible. */
    if (!form.flexible && form.dateIso && !form.slotIso) {
      errors.slotIso = 'Pick a time, or choose "I’m flexible" instead.';
    }
  }

  if (stepId === 'you') {
    if (!form.name.trim()) errors.name = 'I need a name to put on this.';
    if (!form.email.trim()) {
      errors.email = 'I need an email to reply to.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      errors.email = 'That email address doesn’t look right.';
    }
  }

  return errors;
}

/* --------------------------------------------------------------- field --- */
function Field({ label, hint, error, htmlFor, children }) {
  return (
    <div className="bk-field">
      <label className="bk-label" htmlFor={htmlFor}>
        {label}
      </label>
      {hint && <p className="bk-hint">{hint}</p>}
      {children}
      {error && (
        <p className="bk-error" role="alert">
          <AlertCircle width={14} height={14} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function Booking() {
  const [params] = useSearchParams();
  const [stage, setStage] = useState('intro'); // 'intro' | number | 'done'
  const [dir, setDir] = useState('fwd');
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    packageSlug: params.get('package') || '',
  }));
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [result, setResult] = useState(null);
  const [taken, setTaken] = useState([]);

  const headingRef = useRef(null);
  const light = useLightWindow();

  const pkg = getPackage(form.packageSlug);
  const stepIndex = typeof stage === 'number' ? stage : -1;
  const step = STEPS[stepIndex];

  /* Editing-only work has no shoot date, so the calendar step drops out. */
  const activeSteps = useMemo(
    () => (pkg?.skipsScheduling ? STEPS.filter((s) => s.id !== 'when') : STEPS),
    [pkg]
  );

  useEffect(() => {
    getBookedSlots().then((r) => r.ok && setTaken(r.slots)).catch(() => {});
  }, []);

  /* Move focus to the new step's heading so a screen reader lands in the right
     place and a keyboard user does not get dumped back at the top of the page. */
  useEffect(() => {
    if (headingRef.current) headingRef.current.focus();
  }, [stage]);

  const set = useCallback((key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }, []);

  const go = (next, direction) => {
    setDir(direction);
    setStage(next);
  };

  const onNext = () => {
    const found = validateStep(step.id, form);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = document.getElementById(`f-${Object.keys(found)[0]}`);
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      first?.focus?.();
      return;
    }
    const currentPos = activeSteps.findIndex((s) => s.id === step.id);
    const nextStep = activeSteps[currentPos + 1];
    if (nextStep) go(STEPS.findIndex((s) => s.id === nextStep.id), 'fwd');
  };

  const onBack = () => {
    const currentPos = activeSteps.findIndex((s) => s.id === step.id);
    if (currentPos <= 0) return go('intro', 'back');
    const prev = activeSteps[currentPos - 1];
    go(STEPS.findIndex((s) => s.id === prev.id), 'back');
  };

  const onSend = async () => {
    setSending(true);
    setSendError(null);
    try {
      const chosen = form.slotIso ? new Date(form.slotIso) : null;
      const tier = pkg?.tiers?.find((t) => t.id === form.tierId) || pkg?.tiers?.[0];

      const payload = {
        packageSlug: form.packageSlug,
        tierId: tier?.id || null,
        tierName: tier?.name || null,
        title: buildTitle(form, pkg),
        vehicle: form.vehicleMake
          ? {
              year: form.vehicleYear || null,
              make: form.vehicleMake,
              model: form.vehicleModel,
              color: form.vehicleColor,
            }
          : null,
        vehicleCount: Number(form.vehicleCount) || 1,
        peopleCount: Number(form.peopleCount) || 0,
        locationPref: form.locationPref,
        shotNotes: [form.wants.map((w) => WANT_CHIPS.find((c) => c.id === w)?.label).filter(Boolean).join(', '), form.notes]
          .filter(Boolean)
          .join(' — '),
        scheduledAt: chosen ? chosen.toISOString() : null,
        durationMinutes: tier?.durationMinutes || null,
        flexible: form.flexible,
        contact: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          source: form.source,
        },
      };

      const res = await submitBooking(payload);
      if (!res.ok) throw new Error(res.message || 'Could not send');
      setResult(res.booking);
      go('done', 'fwd');
    } catch (err) {
      setSendError(
        err.message ||
          'That did not send. Check your connection and try again — nothing was lost.'
      );
    } finally {
      setSending(false);
    }
  };

  /* ------------------------------------------------------------ intro --- */
  if (stage === 'intro') {
    return (
      <>
        <Seo title="Book a shoot" description={`Book a photo shoot with ${site.photographer}. No payment up front.`} />
        <section className="bk bk-intro">
          <div className="wrap wrap-narrow">
            <span className="plate-label">Booking</span>
            <h1 className="bk-intro-title display" tabIndex={-1} ref={headingRef}>
              Let&rsquo;s work out what you want
            </h1>
            <p className="bk-intro-lead">
              Six short steps. Most of it is optional — I would rather have the conversation than
              make you fill in boxes.
            </p>

            <ul className="bk-promises">
              <li>
                <Check width={16} height={16} aria-hidden="true" />
                <span>
                  <strong>No payment now.</strong> Nothing is charged and no card is asked for.
                  I read what you send, then follow up with a quote.
                </span>
              </li>
              <li>
                <Check width={16} height={16} aria-hidden="true" />
                <span>
                  <strong>Nothing is locked in.</strong> Sending this starts a conversation, not a
                  contract.
                </span>
              </li>
              <li>
                <Check width={16} height={16} aria-hidden="true" />
                <span>
                  <strong>Takes about two minutes.</strong> Skip anything you are not sure about.
                </span>
              </li>
            </ul>

            <button type="button" className="btn btn-primary btn-lg" onClick={() => go(0, 'fwd')}>
              Start
              <ArrowRight className="arrow" width={16} height={16} aria-hidden="true" />
            </button>
          </div>
        </section>
        <BookingStyles />
      </>
    );
  }

  /* ------------------------------------------------------------- done --- */
  if (stage === 'done') {
    return (
      <>
        <Seo title="Booking sent" />
        <section className="bk bk-done">
          <div className="wrap wrap-narrow">
            <span className="bk-done-icon" aria-hidden="true">
              <CheckCircle width={28} height={28} />
            </span>
            <h1 className="bk-done-title display" tabIndex={-1} ref={headingRef}>
              Booking sent
            </h1>
            <p className="bk-done-lead">
              That is with me now. Nothing has been charged and nothing is confirmed yet — the next
              move is mine.
            </p>

            {result?.ref && (
              <p className="bk-ref">
                <span className="plate-label">Reference</span>
                <span className="data bk-ref-value">{result.ref}</span>
              </p>
            )}

            <ol className="bk-next">
              <li>
                <strong>I read it properly.</strong> Usually the same day, always within two.
              </li>
              <li>
                <strong>I come back with a quote.</strong> Priced on what you actually asked for,
                not a package you have to squeeze into.
              </li>
              <li>
                <strong>If it works, I send an invoice link.</strong> That is the first time money
                comes up.
              </li>
            </ol>

            {isDemo && (
              <p className="bk-demo-note">
                <AlertCircle width={15} height={15} aria-hidden="true" />
                <span>
                  This is the demo, so nothing was actually sent and no email went anywhere. The
                  booking did land in the dashboard though — open the admin and it is at the top of
                  the list.
                </span>
              </p>
            )}

            <div className="bk-done-ctas">
              <Link to="/portfolio" className="btn btn-secondary">
                Look at the work
              </Link>
              <Link to="/" className="btn btn-ghost">
                Back home
              </Link>
            </div>
          </div>
        </section>
        <BookingStyles />
      </>
    );
  }

  /* ------------------------------------------------------------ steps --- */
  const pos = activeSteps.findIndex((s) => s.id === step.id);
  const total = activeSteps.length;
  const isLast = pos === total - 1;

  return (
    <>
      <Seo title="Book a shoot" />

      <div className="bk-progress" role="status" aria-live="polite">
        <div className="wrap bk-progress-inner">
          <span className="plate-label">
            Step {pos + 1} of {total}
          </span>
          <span className="bk-progress-track" aria-hidden="true">
            <span className="bk-progress-fill" style={{ width: `${((pos + 1) / total) * 100}%` }} />
          </span>
          <span className="plate-label bk-progress-name">{step.title}</span>
        </div>
      </div>

      <section className="bk">
        <div className="wrap wrap-narrow">
          <div key={step.id} className={`bk-step bk-step-${dir}`}>
            <h1 className="bk-step-title" tabIndex={-1} ref={headingRef}>
              {step.title}
            </h1>
            <p className="bk-step-sub">{step.sub}</p>

            {step.id === 'shoot' && <StepShoot form={form} set={set} errors={errors} />}
            {step.id === 'car' && <StepCar form={form} set={set} pkg={pkg} />}
            {step.id === 'when' && (
              <StepWhen form={form} set={set} errors={errors} pkg={pkg} taken={taken} light={light} />
            )}
            {step.id === 'wants' && <StepWants form={form} set={set} />}
            {step.id === 'you' && <StepYou form={form} set={set} errors={errors} />}
            {step.id === 'review' && <StepReview form={form} pkg={pkg} />}

            {sendError && (
              <p className="bk-send-error" role="alert">
                <AlertCircle width={16} height={16} aria-hidden="true" />
                {sendError}
              </p>
            )}

            <div className="bk-nav">
              <button type="button" className="btn btn-ghost" onClick={onBack} disabled={sending}>
                <ArrowLeft width={16} height={16} aria-hidden="true" />
                Back
              </button>

              {isLast ? (
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={onSend}
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <Loading01 className="bk-spin" width={16} height={16} aria-hidden="true" />
                      Sending
                    </>
                  ) : (
                    <>
                      Send booking
                      <ArrowRight className="arrow" width={16} height={16} aria-hidden="true" />
                    </>
                  )}
                </button>
              ) : (
                <button type="button" className="btn btn-primary btn-lg" onClick={onNext}>
                  Continue
                  <ArrowRight className="arrow" width={16} height={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <BookingStyles />
    </>
  );
}

/* ========================================================== step: shoot === */
function StepShoot({ form, set, errors }) {
  return (
    <div id="f-packageSlug">
      <div className="bk-cards">
        {packages.map((p) => {
          const Icon = ICONS[p.icon] || Car01;
          const on = form.packageSlug === p.slug;
          return (
            <button
              key={p.slug}
              type="button"
              className={`bk-card ${on ? 'bk-card-on' : ''}`}
              onClick={() => {
                set('packageSlug', p.slug);
                set('tierId', '');
              }}
              aria-pressed={on}
            >
              <Icon width={20} height={20} aria-hidden="true" />
              <span className="bk-card-name">{p.shortName}</span>
              <span className="bk-card-tag">{p.tagline}</span>
            </button>
          );
        })}
      </div>
      {errors.packageSlug && (
        <p className="bk-error" role="alert">
          <AlertCircle width={14} height={14} aria-hidden="true" />
          {errors.packageSlug}
        </p>
      )}
    </div>
  );
}

/* ============================================================ step: car === */
function StepCar({ form, set, pkg }) {
  return (
    <div className="bk-rows">
      <div className="bk-row-4">
        <Field label="Year" htmlFor="f-vehicleYear">
          <input
            id="f-vehicleYear"
            className="field-input"
            inputMode="numeric"
            placeholder="2019"
            value={form.vehicleYear}
            onChange={(e) => set('vehicleYear', e.target.value)}
          />
        </Field>
        <Field label="Make" htmlFor="f-vehicleMake">
          <input
            id="f-vehicleMake"
            className="field-input"
            placeholder="Porsche"
            value={form.vehicleMake}
            onChange={(e) => set('vehicleMake', e.target.value)}
          />
        </Field>
        <Field label="Model" htmlFor="f-vehicleModel">
          <input
            id="f-vehicleModel"
            className="field-input"
            placeholder="911"
            value={form.vehicleModel}
            onChange={(e) => set('vehicleModel', e.target.value)}
          />
        </Field>
        <Field label="Colour" htmlFor="f-vehicleColor">
          <input
            id="f-vehicleColor"
            className="field-input"
            placeholder="Guards Red"
            value={form.vehicleColor}
            onChange={(e) => set('vehicleColor', e.target.value)}
          />
        </Field>
      </div>

      <div className="bk-row-2">
        <Field label="How many cars" htmlFor="f-vehicleCount">
          <input
            id="f-vehicleCount"
            className="field-input"
            type="number"
            min="1"
            max="40"
            value={form.vehicleCount}
            onChange={(e) => set('vehicleCount', e.target.value)}
          />
        </Field>
        <Field label="How many people" hint="Including you, if you want to be in shots." htmlFor="f-peopleCount">
          <input
            id="f-peopleCount"
            className="field-input"
            type="number"
            min="0"
            max="60"
            value={form.peopleCount}
            onChange={(e) => set('peopleCount', e.target.value)}
          />
        </Field>
      </div>

      {pkg?.slug === 'editing' && (
        <p className="bk-aside">
          For editing work I do not need the car at all — just the files. We will sort out how to
          get them to me once we talk.
        </p>
      )}
    </div>
  );
}

/* =========================================================== step: when === */
function StepWhen({ form, set, errors, pkg, taken, light }) {
  const duration = pkg?.tiers?.[0]?.durationMinutes || 90;
  const dates = useMemo(() => selectableDates(45), []);
  const selected = form.dateIso ? new Date(`${form.dateIso}T12:00:00`) : null;

  const slots = useMemo(
    () => (selected ? slotsForDate(selected, duration, taken) : []),
    [form.dateIso, duration, taken] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="bk-rows">
      <Field
        label="Where would you like to shoot?"
        hint="A spot you have in mind, a rough area, or leave it to me."
        htmlFor="f-locationPref"
      >
        <input
          id="f-locationPref"
          className="field-input"
          placeholder="Back roads near Media, or somewhere you suggest"
          value={form.locationPref}
          onChange={(e) => set('locationPref', e.target.value)}
        />
      </Field>

      <div className="bk-light-note plate">
        <span className="plate-label">Why the time matters</span>
        <LightWedge light={light} compact />
        <p>
          The hour after sunrise and the hour before sunset are marked{' '}
          <strong>recommended</strong> below. That light is low and warm and it wraps around a car
          instead of flattening it — it is where most of the portfolio comes from. Midday works
          fine for events and group shoots, where everyone needs to see what they are doing.
        </p>
      </div>

      {visitorIsElsewhere() && (
        <p className="bk-aside">
          Your device is on a different clock to the shoot. Every time below is shown in{' '}
          {shootZoneLabel()}, where the shoot actually happens — not your local time.
        </p>
      )}

      <fieldset className="bk-fieldset">
        <legend className="bk-label">Pick a date</legend>
        <div className="hscroll-wrap"><div className="bk-dates hscroll" role="group" aria-label="Available dates" tabIndex={0}>
          {dates.slice(0, 21).map((d) => (
            <button
              key={d.iso}
              type="button"
              className={`bk-date ${form.dateIso === d.iso ? 'bk-date-on' : ''}`}
              disabled={!d.ok}
              title={d.reason || undefined}
              aria-label={`${shootDate(d.date, { weekday: 'long' })}${d.ok ? '' : ` — ${d.reason}`}`}
              onClick={() => {
                set('dateIso', d.iso);
                set('slotIso', '');
                set('flexible', false);
              }}
            >
              <span className="bk-date-dow">{shootDate(d.date, { weekday: 'short', month: undefined, day: undefined, year: undefined })}</span>
              <span className="bk-date-num data">{zonedParts(d.date).day}</span>
              <span className="bk-date-mon">{shootDate(d.date, { month: 'short', day: undefined, year: undefined })}</span>
            </button>
          ))}
        </div></div>
      </fieldset>

      {selected && (
        <fieldset className="bk-fieldset" id="f-slotIso">
          <legend className="bk-label">
            Times on {shootDate(selected, { weekday: 'long' })}{' '}
            <span className="bk-tz">all times {shootZoneLabel()}</span>
          </legend>
          {slots.length === 0 ? (
            <p className="bk-empty">
              Nothing open that day. Try another date, or pick &ldquo;I&rsquo;m flexible&rdquo; and
              I will suggest something.
            </p>
          ) : (
            <div className="bk-slots" role="group" aria-label="Available times">
              {slots.map((s) => {
                const info = LIGHT_LABELS[s.lightWindow];
                return (
                  <button
                    key={s.iso}
                    type="button"
                    className={`bk-slot ${form.slotIso === s.iso ? 'bk-slot-on' : ''} ${
                      s.recommended ? 'bk-slot-rec' : ''
                    }`}
                    onClick={() => {
                      set('slotIso', s.iso);
                      set('flexible', false);
                    }}
                    aria-pressed={form.slotIso === s.iso}
                  >
                    <span className="bk-slot-time data">{shootTime(s.at)}</span>
                    <span className="bk-slot-light">{info?.short}</span>
                    {s.recommended && <span className="badge badge-ok bk-slot-badge">Best light</span>}
                  </button>
                );
              })}
            </div>
          )}
          {errors.slotIso && (
            <p className="bk-error" role="alert">
              <AlertCircle width={14} height={14} aria-hidden="true" />
              {errors.slotIso}
            </p>
          )}
        </fieldset>
      )}

      <label className="bk-check">
        <input
          type="checkbox"
          checked={form.flexible}
          onChange={(e) => {
            set('flexible', e.target.checked);
            if (e.target.checked) {
              set('dateIso', '');
              set('slotIso', '');
            }
          }}
        />
        <span>
          <strong>I&rsquo;m flexible</strong> — suggest a time that suits the light.
        </span>
      </label>
    </div>
  );
}

/* ========================================================== step: wants === */
function StepWants({ form, set }) {
  const toggle = (id) =>
    set('wants', form.wants.includes(id) ? form.wants.filter((w) => w !== id) : [...form.wants, id]);

  return (
    <div className="bk-rows">
      <fieldset className="bk-fieldset">
        <legend className="bk-label">Anything you already know you want</legend>
        <div className="bk-chips">
          {WANT_CHIPS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`bk-chip ${form.wants.includes(c.id) ? 'bk-chip-on' : ''}`}
              onClick={() => toggle(c.id)}
              aria-pressed={form.wants.includes(c.id)}
            >
              {form.wants.includes(c.id) && <Check width={13} height={13} aria-hidden="true" />}
              {c.label}
            </button>
          ))}
        </div>
      </fieldset>

      <Field
        label="Anything else"
        hint="A shot you have seen, something specific about the car, somewhere it means something to you. Or leave it blank."
        htmlFor="f-notes"
      >
        <textarea
          id="f-notes"
          className="field-textarea"
          placeholder="It has a respray I want to show off properly, and I would love something with the bridge in the background."
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </Field>
    </div>
  );
}

/* ============================================================ step: you === */
function StepYou({ form, set, errors }) {
  return (
    <div className="bk-rows">
      <div className="bk-row-2">
        <Field label="Name" error={errors.name} htmlFor="f-name">
          <input
            id="f-name"
            className="field-input"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </Field>
        <Field label="Email" error={errors.email} htmlFor="f-email">
          <input
            id="f-email"
            className="field-input"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>
      </div>

      <div className="bk-row-2">
        <Field label="Phone" hint="Optional. Faster on the day of a shoot." htmlFor="f-phone">
          <input
            id="f-phone"
            className="field-input"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </Field>
        <Field label="How did you find me?" htmlFor="f-source">
          <select
            id="f-source"
            className="field-select"
            value={form.source}
            onChange={(e) => set('source', e.target.value)}
          >
            <option value="">Prefer not to say</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

/* ========================================================= step: review === */
function StepReview({ form, pkg }) {
  const slot = form.slotIso ? new Date(form.slotIso) : null;
  const vehicle = [form.vehicleYear, form.vehicleMake, form.vehicleModel].filter(Boolean).join(' ');
  const wants = form.wants.map((w) => WANT_CHIPS.find((c) => c.id === w)?.label).filter(Boolean);

  const rows = [
    ['Shoot', pkg ? pkg.name : '—'],
    ['Car', vehicle ? `${vehicle}${form.vehicleColor ? ` · ${form.vehicleColor}` : ''}` : 'Not said yet'],
    ['Vehicles', String(form.vehicleCount || 1)],
    ['People', String(form.peopleCount || 0)],
    ['Where', form.locationPref || 'Open to suggestions'],
    ['When', form.flexible ? 'Flexible — you suggest' : slot ? `${shootDate(slot)} at ${shootTime(slot)} ${shootZoneLabel(slot)}` : 'Not picked yet'],
    ['After', wants.length ? wants.join(', ') : '—'],
    ['Name', form.name || '—'],
    ['Email', form.email || '—'],
    ['Phone', form.phone || '—'],
  ];

  return (
    <div className="bk-rows">
      <div className="plate bk-summary">
        {rows.map(([k, v]) => (
          <div className="plate-row" key={k}>
            <span className="plate-label">{k}</span>
            <span className="bk-summary-value">{v}</span>
          </div>
        ))}
      </div>

      {form.notes && (
        <div className="plate bk-summary bk-summary-notes">
          <span className="plate-label">In your words</span>
          <p>{form.notes}</p>
        </div>
      )}

      <div className="bk-nopay">
        <h2>Nothing is charged now</h2>
        <p>
          There is no card field in this form and there never will be. You send this, I read it,
          and I come back with a quote based on what you actually asked for. If it works for you,
          I send an invoice link then — and not before.
        </p>
      </div>
    </div>
  );
}

function buildTitle(form, pkg) {
  const vehicle = [form.vehicleMake, form.vehicleModel].filter(Boolean).join(' ');
  const kind = pkg?.shortName || 'Shoot';
  return vehicle ? `${vehicle} — ${kind}` : `${kind} enquiry`;
}

/* ============================================================== styles === */
function BookingStyles() {
  return (
    <style>{`
      .bk { padding-block: var(--space-12) var(--space-20); }

      /* --- intro --- */
      .bk-intro-title { font-size: clamp(2.2rem, 6vw, 3.5rem); margin: var(--space-3) 0 var(--space-4); }
      .bk-intro-title:focus { outline: none; }
      .bk-intro-lead { font-size: 1.05rem; color: var(--ink-soft); margin: 0 0 var(--space-8); max-width: 52ch; }

      .bk-promises { list-style: none; margin: 0 0 var(--space-10); padding: 0; display: grid; gap: var(--space-4); }
      .bk-promises li { display: flex; gap: var(--space-3); align-items: flex-start; color: var(--ink-soft); line-height: 1.6; }
      .bk-promises svg { flex: none; margin-top: 3px; color: var(--ink); }
      .bk-promises strong { color: var(--ink); }

      /* --- progress --- */
      .bk-progress {
        position: sticky;
        top: 61px;
        z-index: 50;
        background: var(--ground-deep);
        border-bottom: 1px solid var(--edge);
      }
      .bk-progress-inner { display: flex; align-items: center; gap: var(--space-4); padding-block: var(--space-3); }
      .bk-progress-track { flex: 1; height: 3px; background: var(--edge); border-radius: 2px; overflow: hidden; }
      .bk-progress-fill { display: block; height: 100%; background: var(--ink); transition: width var(--duration) var(--ease); }
      .bk-progress-name { white-space: nowrap; }

      /* --- step shell --- */
      .bk-step-title {
        font-family: var(--font-display);
        font-variation-settings: 'wdth' var(--wdth-display);
        font-weight: 800;
        text-transform: uppercase;
        font-size: clamp(1.75rem, 4.5vw, 2.6rem);
        line-height: 1;
        color: var(--ink);
        margin: 0 0 var(--space-2);
      }
      .bk-step-title:focus { outline: none; }
      .bk-step-sub { margin: 0 0 var(--space-8); color: var(--ink-soft); }

      /* Direction-aware entrance. Short and flat — this is navigation feedback,
         not a performance. */
      .bk-step { animation: bk-in-fwd var(--duration) var(--ease) both; }
      .bk-step-back { animation-name: bk-in-back; }

      @keyframes bk-in-fwd {
        from { opacity: 0; transform: translate3d(16px, 0, 0); }
        to { opacity: 1; transform: none; }
      }
      @keyframes bk-in-back {
        from { opacity: 0; transform: translate3d(-16px, 0, 0); }
        to { opacity: 1; transform: none; }
      }

      @media (prefers-reduced-motion: reduce) {
        .bk-step { animation: bk-fade 0.01ms both; }
        @keyframes bk-fade { from { opacity: 1; } to { opacity: 1; } }
      }

      .bk-rows { display: grid; gap: var(--space-6); }
      .bk-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
      .bk-row-4 { display: grid; grid-template-columns: 0.7fr 1fr 1fr 1fr; gap: var(--space-3); }

      .bk-field { display: grid; gap: var(--space-2); align-content: start; }
      .bk-label {
        font-family: var(--font-mono);
        font-size: 0.68rem;
        font-weight: 500;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ink-soft);
      }
      .bk-hint { margin: 0; font-size: 0.8rem; color: var(--ink-soft); }
      .bk-error {
        display: flex; align-items: center; gap: var(--space-2);
        margin: var(--space-2) 0 0; font-size: 0.82rem; color: var(--alert-ink); font-weight: 500;
      }
      .bk-fieldset { border: none; margin: 0; padding: 0; display: grid; gap: var(--space-3); }
      .bk-aside, .bk-empty {
        margin: 0; padding: var(--space-4);
        background: var(--panel); border: 1px solid var(--edge);
        border-radius: var(--radius); color: var(--ink-soft); font-size: 0.88rem;
      }

      /* --- shoot cards --- */
      .bk-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-3); }
      .bk-card {
        display: flex; flex-direction: column; gap: var(--space-2);
        padding: var(--space-4); text-align: left;
        background: var(--panel); border: 1px solid var(--edge-strong);
        border-radius: var(--radius); color: var(--ink-soft);
        transition: background-color var(--duration-fast) var(--ease),
          border-color var(--duration-fast) var(--ease),
          transform var(--duration-fast) var(--ease);
      }
      .bk-card:hover { background: var(--panel-high); transform: translateY(-1px); }
      .bk-card-on { background: var(--panel-high); border-color: var(--ink); box-shadow: inset 0 0 0 1px var(--ink); }
      .bk-card svg { color: var(--ink); }
      .bk-card-name { font-weight: 700; color: var(--ink); font-size: 0.95rem; }
      .bk-card-tag { font-size: 0.78rem; line-height: 1.45; }

      /* --- dates --- */
      .bk-date {
        width: 62px;
        display: grid; gap: 1px; place-items: center;
        padding: var(--space-3) var(--space-2);
        background: var(--panel); border: 1px solid var(--edge-strong);
        border-radius: var(--radius); color: var(--ink-soft);
        scroll-snap-align: start;
        transition: background-color var(--duration-fast) var(--ease), border-color var(--duration-fast) var(--ease);
      }
      .bk-date:hover:not(:disabled) { background: var(--panel-high); }
      .bk-date:disabled { opacity: 0.4; cursor: not-allowed; }
      .bk-date-on { background: var(--ink) !important; border-color: var(--ink); color: var(--ground); }
      .bk-date-on .bk-date-num { color: var(--ground); }
      .bk-date-dow, .bk-date-mon { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; }
      .bk-date-num { font-size: 1.15rem; font-weight: 700; color: var(--ink); line-height: 1.1; }

      /* --- slots --- */
      .bk-slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: var(--space-2); }
      .bk-slot {
        position: relative; display: grid; gap: 2px; justify-items: start; align-content: start; min-height: 74px;
        padding: var(--space-3) var(--space-4);
        background: var(--panel); border: 1px solid var(--edge-strong);
        border-radius: var(--radius); color: var(--ink-soft);
        transition: background-color var(--duration-fast) var(--ease), border-color var(--duration-fast) var(--ease);
      }
      .bk-slot:hover { background: var(--panel-high); }
      .bk-slot-rec { border-color: var(--ink); }
      .bk-slot-on { background: var(--ink) !important; border-color: var(--ink); color: var(--ground); }
      .bk-slot-on .bk-slot-time { color: var(--ground); }
      .bk-slot-time { font-size: 1rem; font-weight: 700; color: var(--ink); }
      .bk-slot-light { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; }
      .bk-slot-badge { margin-top: var(--space-1); }
      .bk-tz { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em; color: var(--ink-soft); text-transform: uppercase; }
      .bk-slot-on .bk-slot-badge { background: var(--ground); color: var(--ink); }

      .bk-light-note { padding: var(--space-5); display: grid; gap: var(--space-3); }
      .bk-light-note p { margin: 0; font-size: 0.88rem; color: var(--ink-soft); line-height: 1.65; }
      .bk-light-note strong { color: var(--ink); }

      /* --- chips --- */
      .bk-chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }
      .bk-chip {
        display: inline-flex; align-items: center; gap: var(--space-2);
        padding: var(--space-2) var(--space-4);
        background: var(--panel); border: 1px solid var(--edge-strong);
        border-radius: var(--radius); color: var(--ink-soft); font-size: 0.85rem; font-weight: 500;
        transition: background-color var(--duration-fast) var(--ease), color var(--duration-fast) var(--ease);
      }
      .bk-chip:hover { background: var(--panel-high); color: var(--ink); }
      .bk-chip-on { background: var(--ink); border-color: var(--ink); color: var(--ground); }

      .bk-check { display: flex; gap: var(--space-3); align-items: flex-start; cursor: pointer; color: var(--ink-soft); }
      .bk-check input { margin-top: 3px; width: 17px; height: 17px; accent-color: var(--ink); flex: none; }
      .bk-check strong { color: var(--ink); }

      /* --- review --- */
      .bk-summary { padding: var(--space-5); }
      .bk-summary-value { color: var(--ink); font-weight: 500; text-align: right; }
      .bk-summary-notes { display: grid; gap: var(--space-3); }
      .bk-summary-notes p { margin: 0; color: var(--ink-soft); line-height: 1.65; }

      .bk-nopay { padding: var(--space-6); border: 1px solid var(--ink); border-radius: var(--radius); }
      .bk-nopay h2 { margin: 0 0 var(--space-3); font-size: 1.15rem; }
      .bk-nopay p { margin: 0; color: var(--ink-soft); line-height: 1.7; font-size: 0.92rem; }

      /* --- nav --- */
      .bk-nav {
        display: flex; align-items: center; justify-content: space-between;
        gap: var(--space-4); margin-top: var(--space-10);
        padding-top: var(--space-6); border-top: 1px solid var(--edge);
      }
      .bk-send-error {
        display: flex; align-items: center; gap: var(--space-2);
        margin: var(--space-6) 0 0; padding: var(--space-4);
        background: var(--alert-tint); color: var(--alert-ink);
        border-radius: var(--radius); font-size: 0.88rem; font-weight: 500;
      }
      .bk-spin { animation: bk-spin 0.9s linear infinite; }
      @keyframes bk-spin { to { transform: rotate(360deg); } }

      /* --- done --- */
      .bk-done-icon { display: inline-grid; place-items: center; color: var(--ok-ink); margin-bottom: var(--space-4); }
      .bk-done-title { font-size: clamp(2.2rem, 6vw, 3.5rem); margin: 0 0 var(--space-4); }
      .bk-done-title:focus { outline: none; }
      .bk-done-lead { font-size: 1.05rem; color: var(--ink-soft); margin: 0 0 var(--space-6); max-width: 52ch; }
      .bk-ref { display: flex; align-items: baseline; gap: var(--space-3); margin: 0 0 var(--space-8); }
      .bk-ref-value { font-size: 1.1rem; font-weight: 600; color: var(--ink); }
      .bk-next { margin: 0 0 var(--space-8); padding-left: var(--space-5); display: grid; gap: var(--space-3); color: var(--ink-soft); line-height: 1.65; }
      .bk-next strong { color: var(--ink); }
      .bk-demo-note {
        display: flex; gap: var(--space-3); align-items: flex-start;
        margin: 0 0 var(--space-8); padding: var(--space-4);
        background: var(--panel); border: 1px solid var(--edge-strong);
        border-radius: var(--radius); color: var(--ink-soft); font-size: 0.88rem; line-height: 1.6;
      }
      .bk-demo-note svg { flex: none; margin-top: 2px; }
      .bk-done-ctas { display: flex; flex-wrap: wrap; gap: var(--space-3); }

      @media (max-width: 700px) {
        .bk-row-2, .bk-row-4 { grid-template-columns: 1fr 1fr; }
        .bk-progress { top: 57px; }
        .bk-progress-name { display: none; }
        .bk-nav { flex-direction: column-reverse; align-items: stretch; }
        .bk-nav .btn { width: 100%; }
      }
    `}</style>
  );
}
