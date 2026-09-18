import { useEffect, useRef, useState } from 'react';
import Plus from '@untitled-ui/icons-react/build/esm/Plus';
import Trash01 from '@untitled-ui/icons-react/build/esm/Trash01';
import ChevronUp from '@untitled-ui/icons-react/build/esm/ChevronUp';
import ChevronDown from '@untitled-ui/icons-react/build/esm/ChevronDown';
import UploadCloud01 from '@untitled-ui/icons-react/build/esm/UploadCloud01';
import Loading01 from '@untitled-ui/icons-react/build/esm/Loading01';
import RefreshCw01 from '@untitled-ui/icons-react/build/esm/RefreshCw01';
import Check from '@untitled-ui/icons-react/build/esm/Check';
import AlertCircle from '@untitled-ui/icons-react/build/esm/AlertCircle';

import ImageField, { directSrc } from './ImageField';
import { uploadImage, deleteImage } from '../../lib/api';
import { prepareImage, ACCEPT, formatBytes } from '../../lib/imageResize';
import { CLOUDINARY_PREFIX } from '../../../shared/content-schema.js';

/* ===========================================================================
   Schema-driven form fields.
   ---------------------------------------------------------------------------
   One renderer per field type from shared/content-schema.js. Adding a field to
   a section puts a control on the screen with no work here, which is the point
   of having the schema at all.
   =========================================================================== */

export function Field({ field, value, onChange, idPrefix = 'cf', publishedUrls }) {
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
          publishedUrls={publishedUrls}
          cover
        />
        {field.help && <p className="cf-help">{field.help}</p>}
      </div>
    );
  }

  /* ------------------------------------------------------ image list --- */
  if (field.type === 'imagelist') {
    return <ImageList field={field} value={value} onChange={onChange} publishedUrls={publishedUrls} />;
  }

  /* ----------------------------------------------------------- list --- */
  if (field.type === 'list') {
    return <ListField field={field} value={value} onChange={onChange} idPrefix={id} publishedUrls={publishedUrls} />;
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

function ListField({ field, value, onChange, idPrefix, publishedUrls }) {
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
                ? `: ${item.title || item.question || item.author}`
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
                publishedUrls={publishedUrls}
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

/* ---------------------------------------------------------------------------
   Upload queue.
   ---------------------------------------------------------------------------
   A whole shoot at once. Every file is its own job with its own stage and
   progress bar; two run at a time (a phone connection does not benefit from
   more, and forty parallel requests mostly time out). One failing does not
   stop the others, and a failed job can be retried on its own.

   Photographs are inserted into the gallery in the order they were selected,
   not the order they happened to finish, and every one lands in the DRAFT.
   Nothing is on the site until publish.
   --------------------------------------------------------------------------- */

const CONCURRENCY = 2;
const MAX_ORIGINAL_BYTES = 60 * 1024 * 1024;
const ACCEPTED = new Set(ACCEPT.split(','));
const OK_EXT = /\.(jpe?g|png|webp|avif)$/i;

let nextJobId = 1;

/** Cheap checks before any decoding, so a bad file fails instantly and clearly. */
function precheck(file) {
  const typeOk = ACCEPTED.has(file.type) || (!file.type && OK_EXT.test(file.name));
  if (!typeOk) {
    const ext = (file.name.match(/\.[a-z0-9]+$/i) || ['no extension'])[0];
    return `Not a format the site can use (${file.type || ext}). Use JPEG, PNG or WebP.`;
  }
  if (file.size > MAX_ORIGINAL_BYTES) {
    return `Too large: ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_ORIGINAL_BYTES)} per photograph.`;
  }
  return null;
}

function useUploadQueue({ folder, name, onDone }) {
  const [jobs, setJobs] = useState([]);
  const running = useRef(0);
  const jobsRef = useRef([]);
  const pump = useRef(null);
  jobsRef.current = jobs;

  const patch = (id, changes) =>
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...changes } : j)));

  const run = async (job) => {
    running.current += 1;
    patch(job.id, { stage: 'preparing', progress: 0, message: null });
    try {
      const { blob, width, height } = await prepareImage(job.file);
      patch(job.id, { stage: 'uploading', progress: 0, sizeAfter: blob.size });
      const res = await uploadImage(blob, {
        folder, name,
        onProgress: (p) => patch(job.id, { progress: p }),
      });
      if (!res.ok) {
        patch(job.id, { stage: 'failed', message: res.message });
      } else {
        patch(job.id, { stage: 'done', progress: 1, url: res.url, width, height });
        onDone({ url: res.url, publicId: res.publicId || '', alt: '' }, job.seq);
      }
    } catch (err) {
      patch(job.id, { stage: 'failed', message: err?.message || 'That file could not be read as an image.' });
    } finally {
      running.current -= 1;
      pump.current?.();
    }
  };

  pump.current = () => {
    const queued = jobsRef.current.filter((j) => j.stage === 'queued');
    while (running.current < CONCURRENCY && queued.length) {
      const job = queued.shift();
      /* Mark synchronously so the next pump call does not pick it twice. */
      jobsRef.current = jobsRef.current.map((j) => (j.id === job.id ? { ...j, stage: 'preparing' } : j));
      run(job);
    }
  };

  useEffect(() => { pump.current?.(); }, [jobs.length]);

  const enqueue = (files, seqStart) => {
    const added = [...files].map((file, i) => {
      const problem = precheck(file);
      return {
        id: nextJobId++,
        seq: seqStart + i,
        file,
        name: file.name,
        size: file.size,
        preview: URL.createObjectURL(file),
        stage: problem ? 'failed' : 'queued',
        message: problem,
        progress: 0,
      };
    });
    setJobs((prev) => [...prev, ...added]);
  };

  const retry = (id) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, stage: 'queued', message: null, progress: 0 } : j)));
    setTimeout(() => pump.current?.(), 0);
  };

  const retryFailed = () => {
    setJobs((prev) => prev.map((j) => (j.stage === 'failed' && !precheck(j.file) ? { ...j, stage: 'queued', message: null, progress: 0 } : j)));
    setTimeout(() => pump.current?.(), 0);
  };

  const clearDone = () => {
    setJobs((prev) => {
      prev.filter((j) => j.stage === 'done').forEach((j) => URL.revokeObjectURL(j.preview));
      return prev.filter((j) => j.stage !== 'done');
    });
  };

  const remove = (id) => setJobs((prev) => prev.filter((j) => j.id !== id));

  return { jobs, enqueue, retry, retryFailed, clearDone, remove };
}

/** Destroy an uploaded asset, unless the live site is still using it. */
function retireIfSafe(img, publishedUrls) {
  const url = img?.url || '';
  if (!url.startsWith(CLOUDINARY_PREFIX)) return;
  if (publishedUrls && publishedUrls.has(url)) return;
  deleteImage({ publicId: img.publicId, url });
}

export function ImageList({ field, value, onChange, folder = 'galleries', name = 'photo', publishedUrls }) {
  const items = Array.isArray(value) ? value : [];
  const itemsRef = useRef(items);
  itemsRef.current = items;

  /* Selection order across the batch: url -> seq, so a photograph that
     finishes early still slots in ahead of the ones picked after it. */
  const seqByUrl = useRef(new Map());
  const seqCounter = useRef(0);
  const [dragging, setDragging] = useState(false);

  const onDone = (img, seq) => {
    seqByUrl.current.set(img.url, seq);
    const current = itemsRef.current;
    let at = current.length;
    for (let i = 0; i < current.length; i += 1) {
      const s = seqByUrl.current.get(current[i].url);
      if (s !== undefined && s > seq) { at = i; break; }
    }
    const next = [...current.slice(0, at), img, ...current.slice(at)];
    itemsRef.current = next;
    onChange(next);
  };

  const queue = useUploadQueue({ folder, name, onDone });

  const takeFiles = (files) => {
    const list = [...(files || [])].filter((f) => f && f.size !== undefined);
    if (!list.length) return;
    const start = seqCounter.current;
    seqCounter.current += list.length;
    queue.enqueue(list, start);
  };

  const move = (i, delta) => {
    const next = [...items];
    const target = i + delta;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  const removeAt = (i) => {
    retireIfSafe(items[i], publishedUrls);
    onChange(items.filter((_, n) => n !== i));
  };

  const active = queue.jobs.filter((j) => j.stage !== 'done');
  const done = queue.jobs.filter((j) => j.stage === 'done').length;
  const failed = queue.jobs.filter((j) => j.stage === 'failed').length;
  const inFlight = queue.jobs.filter((j) => j.stage === 'preparing' || j.stage === 'uploading' || j.stage === 'queued').length;

  return (
    <div className="cf-row cf-gallery">
      <div className="cf-list-head">
        <span className="cf-label">{field.label}</span>
        <span className="cf-list-count">
          {items.length} {items.length === 1 ? 'photograph' : 'photographs'}
        </span>
      </div>

      {/* ------------------------------------------------ the batch --- */}
      {queue.jobs.length > 0 && (
        <div className="cf-batch" role="status" aria-live="polite">
          <div className="cf-batch-head">
            <span className="cf-batch-summary">
              {inFlight ? (
                <><Loading01 className="cf-spin" width={13} height={13} aria-hidden="true" /> Uploading {inFlight} of {queue.jobs.length}</>
              ) : failed ? (
                <><AlertCircle width={13} height={13} aria-hidden="true" /> {done} added, {failed} failed</>
              ) : (
                <><Check width={13} height={13} aria-hidden="true" /> All {done} added to the draft</>
              )}
            </span>
            <span className="cf-batch-tools">
              {failed > 0 && !inFlight && (
                <button type="button" className="cf-btn" onClick={queue.retryFailed}>
                  <RefreshCw01 width={13} height={13} aria-hidden="true" /> Retry failed
                </button>
              )}
              {done > 0 && (
                <button type="button" className="cf-btn cf-btn-quiet" onClick={queue.clearDone}>Clear finished</button>
              )}
            </span>
          </div>

          <ul className="cf-jobs">
            {queue.jobs.map((j) => (
              <li key={j.id} className={`cf-job cf-job-${j.stage}`}>
                <img className="cf-job-thumb" src={j.preview} alt="" />
                <span className="cf-job-main">
                  <span className="cf-job-name">{j.name}</span>
                  <span className="cf-job-meta">
                    {j.stage === 'queued' && 'Waiting'}
                    {j.stage === 'preparing' && 'Resizing'}
                    {j.stage === 'uploading' && `Uploading ${formatBytes(j.sizeAfter || j.size)}, ${Math.round(j.progress * 100)}%`}
                    {j.stage === 'done' && `Added, ${formatBytes(j.sizeAfter || j.size)}`}
                    {j.stage === 'failed' && j.message}
                  </span>
                  {(j.stage === 'uploading' || j.stage === 'preparing' || j.stage === 'queued') && (
                    <span className="cf-job-bar" aria-hidden="true">
                      <span className="cf-job-fill" style={{ width: `${Math.round((j.stage === 'uploading' ? j.progress : 0) * 100)}%` }} />
                    </span>
                  )}
                </span>
                <span className="cf-job-side">
                  {j.stage === 'done' && <Check width={16} height={16} aria-hidden="true" />}
                  {(j.stage === 'preparing' || j.stage === 'uploading') && <Loading01 className="cf-spin" width={16} height={16} aria-hidden="true" />}
                  {j.stage === 'failed' && (
                    <>
                      {!precheck(j.file) && (
                        <button type="button" className="cf-icon-btn" onClick={() => queue.retry(j.id)} aria-label={`Retry ${j.name}`}>
                          <RefreshCw01 width={14} height={14} aria-hidden="true" />
                        </button>
                      )}
                      <button type="button" className="cf-icon-btn cf-icon-danger" onClick={() => queue.remove(j.id)} aria-label={`Dismiss ${j.name}`}>
                        <Trash01 width={14} height={14} aria-hidden="true" />
                      </button>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ------------------------------------------------- the grid ---- */}
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
                onChange={(e) => onChange(items.map((m, n) => (n === i ? { ...m, alt: e.target.value } : m)))}
                aria-label={`Description for photograph ${i + 1}`}
              />
              <div className="cf-thumb-tools">
                <button type="button" className="cf-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move photograph ${i + 1} earlier`}>
                  <ChevronUp width={13} height={13} aria-hidden="true" />
                </button>
                <button type="button" className="cf-icon-btn" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move photograph ${i + 1} later`}>
                  <ChevronDown width={13} height={13} aria-hidden="true" />
                </button>
                <button type="button" className="cf-icon-btn cf-icon-danger" onClick={() => removeAt(i)} aria-label={`Remove photograph ${i + 1}`}>
                  <Trash01 width={13} height={13} aria-hidden="true" />
                </button>
              </div>
            </figcaption>
          </figure>
        ))}

        <label
          className={`cf-thumb cf-thumb-add ${dragging ? 'cf-thumb-drop' : ''}`}
          onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); takeFiles(e.dataTransfer?.files); }}
        >
          <input type="file" accept={ACCEPT} multiple onChange={(e) => { takeFiles(e.target.files); e.target.value = ''; }} />
          <UploadCloud01 width={20} height={20} aria-hidden="true" />
          <span>{dragging ? 'Drop to add' : 'Add photographs'}</span>
        </label>
      </div>

      <p className="cf-help">
        Select or drag in as many as you like, a whole shoot at once. Each one is resized in your
        browser and uploads on its own; one that fails does not stop the rest. Order here is the
        order on the page, and nothing is on the site until you publish.
      </p>
    </div>
  );
}
