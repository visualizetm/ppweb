import { useRef, useState } from 'react';
import UploadCloud01 from '@untitled-ui/icons-react/build/esm/UploadCloud01';
import Trash01 from '@untitled-ui/icons-react/build/esm/Trash01';
import Loading01 from '@untitled-ui/icons-react/build/esm/Loading01';

import { uploadImage } from '../../lib/api';
import { prepareImage, formatBytes, ACCEPT } from '../../lib/imageResize';

/* ===========================================================================
   Image field.
   ---------------------------------------------------------------------------
   Pick a file, the browser resizes and re-encodes it, the bytes go straight to
   Vercel Blob, and the returned URL becomes the field value. Nothing is
   committed to git and nothing needs a redeploy.

   An uploaded image lands in the DRAFT like any other edit, so it is not on
   the public site until the next publish.
   =========================================================================== */

export default function ImageField({
  value,
  onChange,
  folder = 'uploads',
  name = 'image',
  label = 'Image',
  cover = false,
  compact = false,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);
  const [error, setError] = useState(null);

  const pick = () => inputRef.current?.click();

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);
    setBusy(true);
    setNote('Resizing');

    try {
      const { blob, width, height } = await prepareImage(file, { cover });
      setNote(`Uploading ${formatBytes(blob.size)}`);

      const res = await uploadImage(blob, { folder, name });
      if (!res.ok) {
        setError(res.message || 'That upload did not go through.');
        setNote(null);
        return;
      }

      onChange(res.url);
      setNote(`${width} by ${height}, ${formatBytes(res.bytes || blob.size)}`);
    } catch (err) {
      setError(err?.message || 'That file could not be read as an image.');
      setNote(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`cf-img ${compact ? 'cf-img-compact' : ''}`}>
      <div className="cf-img-preview">
        {value ? (
          <img src={directSrc(value)} alt="" />
        ) : (
          <span className="cf-img-empty">No image yet</span>
        )}
      </div>

      <div className="cf-img-side">
        <div className="cf-img-actions">
          <button type="button" className="cf-btn" onClick={pick} disabled={busy}>
            {busy ? (
              <Loading01 className="cf-spin" width={14} height={14} aria-hidden="true" />
            ) : (
              <UploadCloud01 width={14} height={14} aria-hidden="true" />
            )}
            {value ? 'Replace' : 'Upload'}
          </button>

          {value && !busy && (
            <button
              type="button"
              className="cf-btn cf-btn-quiet"
              onClick={() => {
                onChange('');
                setNote(null);
              }}
            >
              <Trash01 width={14} height={14} aria-hidden="true" />
              Remove
            </button>
          )}
        </div>

        {note && !error && <p className="cf-img-note">{note}</p>}
        {error && (
          <p className="cf-img-error" role="alert">
            {error}
          </p>
        )}
        {!note && !error && (
          <p className="cf-img-note">
            JPEG, PNG or WebP. Large files are resized in your browser before they upload.
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onFile}
          className="cf-img-input"
          aria-label={`Upload ${label}`}
        />
      </div>
    </div>
  );
}

/* Committed images are stored extension-less and served as a three-file set;
   the preview needs a real file, so it asks for the jpg. Uploaded URLs are
   already complete. */
export function directSrc(src) {
  if (!src) return '';
  if (/^(https?:)?\/\//i.test(src) || /\.[a-z0-9]{2,5}$/i.test(src)) return src;
  return `${src}.jpg`;
}
