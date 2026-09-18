import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  getAdminContent,
  saveContentDraft,
  revertContentDraft,
  publishSections,
  listPublishHistory,
} from '../../lib/api';
import { changedFields, getSection } from '../../../shared/content-schema.js';

/* ===========================================================================
   Content state for the dashboard.
   ---------------------------------------------------------------------------
   Holds every section's draft and published copy, tracks which ones differ,
   and autosaves edits to `draft` after a pause.

   AUTOSAVE WRITES TO DRAFT ONLY. Nothing here can change the public site;
   that is what publish() is for, and it is the only call that touches
   `published`. The separation is the whole point of the feature, so it is
   enforced by there being no other write path rather than by a flag.
   =========================================================================== */

const SAVE_DELAY = 900;

export default function useContentAdmin(authed) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  /* Pending timers and the latest value per section, so a fast typist gets one
     write per pause rather than one per keystroke. */
  const timers = useRef({});
  const latest = useRef({});

  const load = useCallback(async () => {
    const res = await getAdminContent();
    if (!res.ok) {
      setError(res.message || 'Could not load site content.');
      setLoading(false);
      return;
    }
    setError(null);
    setSections(res.sections || []);
    setLoading(false);
  }, []);

  const loadHistory = useCallback(async () => {
    const res = await listPublishHistory();
    if (res.ok) setHistory(res.items || []);
  }, []);

  useEffect(() => {
    if (!authed) return;
    load();
    loadHistory();
  }, [authed, load, loadHistory]);

  /* Flush anything still queued if the dashboard unmounts mid-edit. */
  useEffect(
    () => () => {
      Object.entries(timers.current).forEach(([sectionId, handle]) => {
        clearTimeout(handle);
        if (latest.current[sectionId]) saveContentDraft(sectionId, latest.current[sectionId]);
      });
    },
    []
  );

  const byId = useMemo(() => {
    const map = new Map();
    sections.forEach((s) => map.set(s.section, s));
    return map;
  }, [sections]);

  /** Optimistic local edit plus a debounced write to the draft. */
  const setDraft = useCallback((sectionId, next) => {
    latest.current[sectionId] = next;

    setSections((prev) =>
      prev.map((s) =>
        s.section === sectionId
          ? { ...s, draft: next, changed: changedFields(sectionId, next, s.published) }
          : s
      )
    );

    clearTimeout(timers.current[sectionId]);
    timers.current[sectionId] = setTimeout(async () => {
      setSaving(true);
      const res = await saveContentDraft(sectionId, latest.current[sectionId]);
      setSaving(false);
      if (res.ok && res.draft) {
        /* Adopt the sanitised value. If the server trimmed or dropped
           something, the form should show what was actually stored. */
        setSections((prev) =>
          prev.map((s) =>
            s.section === sectionId
              ? { ...s, draft: res.draft, changed: changedFields(sectionId, res.draft, s.published) }
              : s
          )
        );
      }
    }, SAVE_DELAY);
  }, []);

  /** Immediate write, for actions that should not wait for the debounce
      (uploading an image, deleting a gallery). */
  const flush = useCallback(async (sectionId) => {
    clearTimeout(timers.current[sectionId]);
    const value = latest.current[sectionId];
    if (!value) return;
    setSaving(true);
    const res = await saveContentDraft(sectionId, value);
    setSaving(false);
    if (res.ok && res.draft) {
      setSections((prev) =>
        prev.map((s) =>
          s.section === sectionId
            ? { ...s, draft: res.draft, changed: changedFields(sectionId, res.draft, s.published) }
            : s
        )
      );
    }
  }, []);

  const revert = useCallback(async (sectionId) => {
    clearTimeout(timers.current[sectionId]);
    delete latest.current[sectionId];
    const res = await revertContentDraft(sectionId);
    if (res.ok) await load();
    return res;
  }, [load]);

  const publish = useCallback(
    async (sectionIds) => {
      /* Anything still sitting in a debounce has to land first, or publish
         would copy a stale draft over the live site. */
      await Promise.all(sectionIds.map((id) => flush(id)));
      const res = await publishSections(sectionIds);
      if (res.ok) {
        await load();
        await loadHistory();
      }
      return res;
    },
    [flush, load, loadHistory]
  );

  const pending = useMemo(
    () =>
      sections
        .filter((s) => s.changed?.length)
        .map((s) => ({
          section: s.section,
          label: getSection(s.section)?.label || s.section,
          changed: s.changed,
        })),
    [sections]
  );

  return {
    sections,
    byId,
    pending,
    pendingCount: pending.length,
    history,
    loading,
    saving,
    error,
    setDraft,
    flush,
    revert,
    publish,
    reload: load,
  };
}
