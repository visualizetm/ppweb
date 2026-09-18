import { useState } from 'react';
import Plus from '@untitled-ui/icons-react/build/esm/Plus';
import Trash01 from '@untitled-ui/icons-react/build/esm/Trash01';
import ChevronUp from '@untitled-ui/icons-react/build/esm/ChevronUp';
import ChevronDown from '@untitled-ui/icons-react/build/esm/ChevronDown';
import UploadCloud01 from '@untitled-ui/icons-react/build/esm/UploadCloud01';
import Loading01 from '@untitled-ui/icons-react/build/esm/Loading01';

import ImageField, { directSrc } from './ImageField';
import { uploadImage } from '../../lib/api';
import { prepareImage, ACCEPT } from '../../lib/imageResize';

/* ===========================================================================
   Schema-driven form fields.
   ---------------------------------------------------------------------------
   One renderer per field type from shared/content-schema.js. Adding a field to
   a section puts a control on the screen with no work here, which is the point
   of having the schema at all.
   =========================================================================== */

export function Field({ field, value, onChange, idPrefix = 'cf' }) {
  const id = `${idPrefix}-${field.key}`;

  /* --------------------------------------------------------- toggle --- */
  if (field.type === 'toggle') {
    return (
      <div className="cf-row cf-row-toggle">
        <label className="cf-switch" htmlFor={id}>
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="cf-switch-track" aria-hidden="true">
            <span className="cf-switch-knob" />
          </span>
          <span className="cf-switch-label">{field.label}</span>
        </label>
        {field.help && <p className="cf-help">{field.help}</p>}
      </div>
    );
  }

  /* --------------------------------------------------------- select --- */
  if (field.type === 'select') {
    return (
      <div className="cf-row">
        <label className="cf-label" htmlFor={id}>
          {field.label}
        </label>
        <select
          id={id}
          className="field-input cf-select"
          value={value ?? field.options[0]?.value}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {field.help && <p className="cf-help">{field.help}</p>}
      </div>
    );
  }

  /* ---------------------------------------------------------- money --- */
  if (field.type === 'money') {
    return (
      <div className="cf-row">
        <label className="cf-label" htmlFor={id}>
          {field.label}
        </label>
        <div className="cf-money">
          <span aria-hidden="true">$</span>
          <input
            id={id}
            className="field-input"
            inputMode="decimal"
            placeholder="Quote only"
            value={value === null || value === undefined ? '' : (value / 100).toFixed(2)}
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (!raw) return onChange(null);
              const n = Number(raw.replace(/[^0-9.]/g, ''));
              return onChange(Number.isFinite(n) ? Math.round(n * 100) : null);
            }}
          />
        </div>
        {field.help && <p className="cf-help">{field.help}</p>}
      </div>
    );
  }

  /* ---------------------------------------------------------- image --- */
  if (field.type === 'image') {
    return (
      <div className="cf-row">
        <span className="cf-label">{field.label}</span>
        <ImageField
          value={value}
          onChange={onChange}
          folder={field.folder || 'brand'}
          name={field.key}
          label={field.label}
          cover
        />
        {field.help && <p className="cf-help">{field.help}</p>}
      </div>
    );
  }

  /* ------------------------------------------------------ image list --- */
  if (field.type === 'imagelist') {
    return <ImageList field={field} value={value} onChange={onChange} />;
  }

  /* ----------------------------------------------------------- list --- */
  if (field.type === 'list') {
    return <ListField field={field} value={value} onChange={onChange} idPrefix={id} />;
  }

  /* ---------------------------------------------------------- prose --- */
  if (field.type === 'prose') {
    const text = Array.isArray(value) ? value.join('\n\n') : String(value ?? '');
    return (
      <div className="cf-row">
        <label className="cf-label" htmlFor={id}>
          {field.label}
        </label>
        <textarea
          id={id}
          className="field-input cf-textarea"
          rows={field.rows || 8}
          value={text}
          onChange={(e) => onChange(e.target.value.split(/\n\s*\n/))}
        />
        {field.help && <p className="cf-help">{field.help}</p>}
      </div>
    );
  }

  /* ------------------------------------------------- text / textarea --- */
  const multiline = field.type === 'textarea';
  const str = String(value ?? '');
  const over = field.max ? str.length > field.max * 0.9 : false;

  return (
    <div className="cf-row">
      <label className="cf-label" htmlFor={id}>
        {field.label}
        {field.max && over && (
          <span className="cf-count">
            {str.length} / {field.max}
          </span>
        )}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className="field-input cf-textarea"
          rows={field.rows || 3}
          maxLength={field.max}
          placeholder={field.placeholder}
          value={str}
          readOnly={field.readOnly}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className="field-input"
          type="text"
          maxLength={field.max}
          placeholder={field.placeholder}
          value={str}
          readOnly={field.readOnly}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.help && <p className="cf-help">{field.help}</p>}
    </div>
  );
}

/* ========================================================== list field === */

function ListField({ field, value, onChange, idPrefix }) {
  const items = Array.isArray(value) ? value : [];
  const atMax = items.length >= (field.max || 50);
  /* A row whose identifying key is generated rather than typed cannot be
     added or removed from the dashboard, only edited. Used by the price
     table, where the set of tiers is defined in code. */
  const locked = Boolean(field.lockedKey);

  const update = (i, key, v) =>
    onChange(items.map((item, n) => (n === i ? { ...item, [key]: v } : item)));

  const move = (i, delta) => {
    const next = [...items];
    const target = i + delta;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  const blank = () => {
    const out = {};
    field.fields.forEach((f) => {
      if (f.type === 'toggle') out[f.key] = false;
      else if (f.type === 'list' || f.type === 'imagelist' || f.type === 'prose') out[f.key] = [];
      else if (f.type === 'money') out[f.key] = null;
      else if (f.type === 'select') out[f.key] = f.options[0]?.value ?? '';
      else out[f.key] = '';
    });
    return out;
  };

  return (
    <div className="cf-list">
      <div className="cf-list-head">
        <span className="cf-label">{field.label}</span>
        <span className="cf-list-count">
          {items.length} {items.length === 1 ? field.itemLabel.toLowerCase() : 'items'}
        </span>
      </div>

      {items.map((item, i) => (
        <div key={`${field.key}-${i}`} className="cf-item">
          <div className="cf-item-bar">
            <span className="cf-item-title">
              {field.itemLabel} {i + 1}
              {item.title || item.question || item.author
                ? ` — ${item.title || item.question || item.author}`
                : ''}
            </span>
            <div className="cf-item-tools">
              <button
                type="button"
                className="cf-icon-btn"
                onClick={() => move(i, -1)}
                disabled={i === 0 || locked}
                aria-label={`Move ${field.itemLabel} ${i + 1} up`}
              >
                <ChevronUp width={14} height={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="cf-icon-btn"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1 || locked}
                aria-label={`Move ${field.itemLabel} ${i + 1} down`}
              >
                <ChevronDown width={14} height={14} aria-hidden="true" />
              </button>
              {!locked && (
                <button
                  type="button"
                  className="cf-icon-btn cf-icon-danger"
                  onClick={() => onChange(items.filter((_, n) => n !== i))}
                  aria-label={`Delete ${field.itemLabel} ${i + 1}`}
                >
                  <Trash01 width={14} height={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="cf-item-body">
            {field.fields.map((f) => (
              <Field
                key={f.key}
                field={f}
                value={item[f.key]}
                onChange={(v) => update(i, f.key, v)}
                idPrefix={`${idPrefix}-${i}`}
              />
            ))}
          </div>
        </div>
      ))}

      {!items.length && <p className="cf-empty">Nothing here yet.</p>}

      {!locked && (
        <button
          type="button"
          className="cf-btn cf-btn-add"
          onClick={() => onChange([...items, blank()])}
          disabled={atMax}
        >
          <Plus width={14} height={14} aria-hidden="true" />
          Add {field.itemLabel.toLowerCase()}
        </button>
      )}
    </div>
  );
}

/* ========================================================= image list === */

export function ImageList({ field, value, onChange, folder = 'galleries', name = 'photo' }) {
  const items = Array.isArray(value) ? value : [];
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState(null);

  const move = (i, delta) => {
    const next = [...items];
    const target = i + delta;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  /* Uploads run one at a time on purpose. A photographer selecting forty
     frames on a phone connection would otherwise open forty parallel requests
     and have most of them time out. */
  const onFiles = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;

    setError(null);
    const added = [];

    for (let i = 0; i < files.length; i += 1) {
      setBusy(files.length - i);
      try {
        const { blob } = await prepareImage(files[i]);
        const res = await uploadImage(blob, { folder, name });
        if (res.ok) added.push({ url: res.url, alt: '' });
        else setError(res.message || 'One of those uploads did not go through.');
      } catch {
        setError('One of those files could not be read as an image.');
      }
    }

    setBusy(0);
    if (added.length) onChange([...items, ...added]);
  };

  return (
    <div className="cf-row cf-gallery">
      <div className="cf-list-head">
        <span className="cf-label">{field.label}</span>
        <span className="cf-list-count">
          {items.length} {items.length === 1 ? 'photograph' : 'photographs'}
        </span>
      </div>

      <div className="cf-thumbs">
        {items.map((img, i) => (
          <figure key={`${img.url}-${i}`} className="cf-thumb">
            <img src={directSrc(img.url)} alt="" loading="lazy" />
            <figcaption>
              <input
                className="field-input cf-thumb-alt"
                placeholder="Describe this photograph"
                maxLength={300}
                value={img.alt || ''}
                onChange={(e) =>
                  onChange(items.map((m, n) => (n === i ? { ...m, alt: e.target.value } : m)))
                }
                aria-label={`Description for photograph ${i + 1}`}
              />
              <div className="cf-thumb-tools">
                <button
                  type="button"
                  className="cf-icon-btn"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move photograph ${i + 1} earlier`}
                >
                  <ChevronUp width={13} height={13} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="cf-icon-btn"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  aria-label={`Move photograph ${i + 1} later`}
                >
                  <ChevronDown width={13} height={13} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="cf-icon-btn cf-icon-danger"
                  onClick={() => onChange(items.filter((_, n) => n !== i))}
                  aria-label={`Remove photograph ${i + 1}`}
                >
                  <Trash01 width={13} height={13} aria-hidden="true" />
                </button>
              </div>
            </figcaption>
          </figure>
        ))}

        <label className="cf-thumb cf-thumb-add">
          <input type="file" accept={ACCEPT} multiple onChange={onFiles} />
          {busy ? (
            <>
              <Loading01 className="cf-spin" width={20} height={20} aria-hidden="true" />
              <span>{busy} left</span>
            </>
          ) : (
            <>
              <UploadCloud01 width={20} height={20} aria-hidden="true" />
              <span>Add photographs</span>
            </>
          )}
        </label>
      </div>

      {error && (
        <p className="cf-img-error" role="alert">
          {error}
        </p>
      )}
      <p className="cf-help">
        Select as many as you like. They are resized in your browser and uploaded one at a time.
        Order here is the order on the page.
      </p>
    </div>
  );
}
