import { isAuthed } from '../_lib/auth';

export default async function handler(req, res) {
  const ok = isAuthed(req);
  return res.status(ok ? 200 : 401).json({ ok, session: ok ? { authed: true } : null });
}
