import { useMemo, useState } from 'react';
import Plus from '@untitled-ui/icons-react/build/esm/Plus';
import Trash01 from '@untitled-ui/icons-react/build/esm/Trash01';
import ChevronUp from '@untitled-ui/icons-react/build/esm/ChevronUp';
import ChevronDown from '@untitled-ui/icons-react/build/esm/ChevronDown';
import ArrowLeft from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import XClose from '@untitled-ui/icons-react/build/esm/XClose';
import Check from '@untitled-ui/icons-react/build/esm/Check';
import AlertCircle from '@untitled-ui/icons-react/build/esm/AlertCircle';
import Loading01 from '@untitled-ui/icons-react/build/esm/Loading01';

import { Field, ImageList } from './ContentFields';
import ImageField, { directSrc } from './ImageField';
import { getSection } from '../../../shared/content-schema.js';
import { relativeTime } from '../../lib/format';

/* ===========================================================================
   Content screens.
   ---------------------------------------------------------------------------
   One generic editor that renders any section straight from the schema, one
   bespoke editor for galleries (because a list of shoots wants a master and
   detail layout rather than forty stacked forms), the publish confirmation,
   and the publish history.
   =========================================================================== */

/* ====================================================== section editor === */

export function SectionEditor({ sectionId, row, onChange, onRevert, saving, saveError }) {
  const section = getSection(sectionId);
  if (!section || !row) return null;

  const draft = row.draft || {};
  const dirty = Boolean(row.changed?.length);

  return (
    <>
      <header className="ad-head">
        <div>
          <h1 className="ad-title">{section.label}</h1>
          <p className="cf-blurb">{section.blurb}</p>
        </div>
        <SaveState saving={saving} dirty={dirty} failed={Boolean(saveError)} />
      </header>

      {saveError && (
        <div className="ad-alert" role="alert">
          <p>Your last change was not saved. {saveError}</p>
        </div>
      )}

      {dirty && (
        <div className="cf-dirty" role="status">
          <span>
            <AlertCircle width={15} height={15} aria-hidden="true" />
            Unpublished changes: {row.changed.join(', ')}
          </span>
          <button type="button" className="cf-btn cf-btn-quiet" onClick={() => onRevert(sectionId)}>
            Discard them
          </button>
        </div>
      )}

      <div className="cf-form">
        {section.fields.map((field) => (
          <Field
            key={field.key}
            field={field}
            value={draft[field.key]}
            onChange={(v) => onChange({ ...draft, [field.key]: v })}
            idPrefix={`cf-${sectionId}`}
          />
        ))}
      </div>
    </>
  );
}

function SaveState({ saving, dirty, failed }) {
  if (failed && !saving) {
    return (
      <span className="cf-save cf-save-failed">
        <AlertCircle width={13} height={13} aria-hidden="true" />
        Not saved
      </span>
    );
  }
  if (saving) {
    return (
      <span className="cf-save">
        <Loading01 className="cf-spin" width={13} height={13} aria-hidden="true" />
        Saving
      </span>
    );
  }
  return (
    <span className="cf-save">
      <Check width={13} height={13} aria-hidden="true" />
      {dirty ? 'Saved as draft' : 'Saved'}
    </span>
  );
}

/* ====================================================== gallery editor === */

export function GalleriesEditor({ row, onChange, onRevert, saving, saveError, onSay }) {
  const [openIndex, setOpenIndex] = useState(null);

  const draft = row?.draft || { items: [] };
  const items = useMemo(() => (Array.isArray(draft.items) ? draft.items : []), [draft.items]);
  const dirty = Boolean(row?.changed?.length);

  const section = getSection('galleries');
  const itemFields = section.fields[0].fields;

  const setItems = (next) => onChange({ ...draft, items: next });

  const update = (i, patch) =>
    setItems(items.map((g, n) => (n === i ? { ...g, ...patch } : g)));

  const move = (i, delta) => {
    const next = [...items];
    const target = i + delta;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    setItems(next);
    if (openIndex === i) setOpenIndex(target);
  };

  const remove = (i) => {
    setItems(items.filter((_, n) => n !== i));
    setOpenIndex(null);
    onSay?.('Gallery removed from the draft. It is still live until you publish.');
  };

  const add = () => {
    const stamp = new Date();
    const blank = {
      title: 'New shoot',
      slug: `shoot-${stamp.getTime().toString().slice(-6)}`,
      caption: '',
      dateLabel: `${stamp.getMonth() + 1}/${stamp.getDate()}/${String(stamp.getFullYear()).slice(-2)}`,
      type: 'Solo',
      location: '',
      blurb: '',
      cover: '',
      coverAlt: '',
      featured: false,
      images: [],
    };
    setItems([blank, ...items]);
    setOpenIndex(0);
  };

  /* ------------------------------------------------------------ detail -- */
  if (openIndex !== null && items[openIndex]) {
    const gallery = items[openIndex];
    const patch = (key, v) => update(openIndex, { [key]: v });

    return (
      <>
        <header className="ad-head">
          <div className="cf-detail-head">
            <button type="button" className="cf-back" onClick={() => setOpenIndex(null)}>
              <ArrowLeft width={15} height={15} aria-hidden="true" />
              All galleries
            </button>
            <h1 className="ad-title">{gallery.title || 'Untitled gallery'}</h1>
          </div>
          <SaveState saving={saving} dirty={dirty} failed={Boolean(saveError)} />
        </header>

        {saveError && (
          <div className="ad-alert" role="alert">
            <p>Your last change was not saved. {saveError}</p>
          </div>
        )}

        <div className="cf-form">
          {itemFields
            .filter((f) => f.key !== 'images')
            .map((field) => (
              <Field
                key={field.key}
                field={field.key === 'cover' ? { ...field, folder: 'galleries' } : field}
                value={gallery[field.key]}
                onChange={(v) => patch(field.key, v)}
                idPrefix={`gal-${openIndex}`}
              />
            ))}

          <ImageList
            field={{ key: 'images', label: 'Photographs', max: 200 }}
            value={gallery.images}
            onChange={(v) => patch('images', v)}
            folder="galleries"
            name={gallery.slug || 'photo'}
          />
        </div>
      </>
    );
  }

  /* -------------------------------------------------------------- list -- */
  const missing = items.filter((g) => !g.images?.length).length;

  return (
    <>
      <header className="ad-head">
        <div>
          <h1 className="ad-title">Galleries</h1>
          <p className="cf-blurb">
            {items.length} {items.length === 1 ? 'gallery' : 'galleries'}
            {missing ? `, ${missing} still without photographs` : ''}. Drag order is top to bottom.
          </p>
        </div>
        <div className="cf-head-tools">
          <SaveState saving={saving} dirty={dirty} failed={Boolean(saveError)} />
          <button type="button" className="cf-btn cf-btn-primary" onClick={add}>
            <Plus width={14} height={14} aria-hidden="true" />
            New gallery
          </button>
        </div>
      </header>

      {saveError && (
        <div className="ad-alert" role="alert">
          <p>Your last change was not saved. {saveError}</p>
        </div>
      )}

      {dirty && (
        <div className="cf-dirty" role="status">
          <span>
            <AlertCircle width={15} height={15} aria-hidden="true" />
            Unpublished changes: {row.changed.join(', ')}
          </span>
          <button type="button" className="cf-btn cf-btn-quiet" onClick={() => onRevert('galleries')}>
            Discard them
          </button>
        </div>
      )}

      <ul className="cf-gal-rows">
        {items.map((g, i) => (
          <li key={`${g.slug}-${i}`} className="cf-gal-row">
            <div className="cf-gal-thumb">
              {g.cover ? (
                <img src={directSrc(g.cover)} alt="" loading="lazy" />
              ) : (
                <span className="cf-gal-nocover">No cover</span>
              )}
            </div>

            <button type="button" className="cf-gal-main" onClick={() => setOpenIndex(i)}>
              <span className="cf-gal-title">
                {g.title || 'Untitled'}
                {g.featured && <span className="cf-tag">Featured</span>}
              </span>
              <span className="cf-gal-meta">
                <span className="data">{g.slug}</span>
                {g.dateLabel ? ` · ${g.dateLabel}` : ''}
                {` · ${g.images?.length || 0} photographs`}
              </span>
            </button>

            <div className="cf-item-tools">
              <button
                type="button"
                className="cf-icon-btn"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move ${g.title} up`}
              >
                <ChevronUp width={14} height={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="cf-icon-btn"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                aria-label={`Move ${g.title} down`}
              >
                <ChevronDown width={14} height={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="cf-icon-btn cf-icon-danger"
                onClick={() => remove(i)}
                aria-label={`Delete ${g.title}`}
              >
                <Trash01 width={14} height={14} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!items.length && (
        <div className="ad-empty ad-empty-page">
          <h3>No galleries yet</h3>
          <p>Start one with the button above, then upload the photographs into it.</p>
        </div>
      )}
    </>
  );
}

/* ========================================================= publish flow === */

export function PublishDialog({ pending, onCancel, onConfirm }) {
  const [selected, setSelected] = useState(() => pending.map((p) => p.section));
  const [busy, setBusy] = useState(false);

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const confirm = async () => {
    setBusy(true);
    await onConfirm(selected);
    setBusy(false);
  };

  return (
    <div className="cf-scrim" role="presentation" onClick={onCancel}>
      <div
        className="cf-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pub-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cf-dialog-head">
          <h2 id="pub-title">Publish to the live site</h2>
          <button type="button" className="cf-icon-btn" onClick={onCancel} aria-label="Close">
            <XClose width={16} height={16} aria-hidden="true" />
          </button>
        </div>

        <div className="cf-dialog-body">
          <p className="cf-dialog-lead">
            These sections have changes that are not on the site yet. Anything you leave unticked
            stays a draft.
          </p>

          <ul className="cf-pub-list">
            {pending.map((p) => (
              <li key={p.section}>
                <label className="cf-pub-row">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.section)}
                    onChange={() => toggle(p.section)}
                  />
                  <span>
                    <span className="cf-pub-label">{p.label}</span>
                    <span className="cf-pub-changed">{p.changed.join(', ')}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="cf-dialog-foot">
          <button type="button" className="cf-btn cf-btn-quiet" onClick={onCancel}>
            Not yet
          </button>
          <button
            type="button"
            className="cf-btn cf-btn-primary"
            onClick={confirm}
            disabled={busy || !selected.length}
          >
            {busy ? (
              <Loading01 className="cf-spin" width={14} height={14} aria-hidden="true" />
            ) : (
              <Check width={14} height={14} aria-hidden="true" />
            )}
            Publish {selected.length} {selected.length === 1 ? 'section' : 'sections'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ====================================================== publish history === */

export function PublishHistoryView({ history }) {
  return (
    <>
      <header className="ad-head">
        <div>
          <h1 className="ad-title">Publish history</h1>
          <p className="cf-blurb">
            Every time something went live, and what was in it. Newest first.
          </p>
        </div>
      </header>

      {!history.length ? (
        <div className="ad-empty ad-empty-page">
          <h3>Nothing published yet</h3>
          <p>
            The site is showing the content it was set up with. The first time you publish a change
            it will be listed here.
          </p>
        </div>
      ) : (
        <ol className="cf-history">
          {history.map((entry) => (
            <li key={entry.id} className="cf-history-item">
              <div className="cf-history-when">
                <span className="cf-history-rel">{relativeTime(entry.publishedAt)}</span>
                <span className="data cf-history-abs">
                  {new Date(entry.publishedAt).toLocaleString()}
                </span>
              </div>
              <div className="cf-history-what">
                {entry.sections.map((s) => (
                  <div key={s.section} className="cf-history-section">
                    <span className="cf-history-label">{s.label}</span>
                    <span className="cf-history-fields">{s.changed.join(', ')}</span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
