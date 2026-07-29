import { makeToken, sessionCookie, passwordOk } from '../_lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  if (!passwordOk(req.body?.password)) {
    /* Deliberately vague, and deliberately slow enough not to be a useful
       oracle. The compare itself is already timing-safe. */
    await new Promise((r) => setTimeout(r, 400));
    return res.status(401).json({ error: 'bad_password', message: 'That password was not right.' });
  }

  res.setHeader('Set-Cookie', sessionCookie(makeToken()));
  return res.status(200).json({ ok: true, session: { authed: true } });
}
