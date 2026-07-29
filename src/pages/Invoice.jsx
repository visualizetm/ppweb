import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import CheckCircle from '@untitled-ui/icons-react/build/esm/CheckCircle';
import AlertCircle from '@untitled-ui/icons-react/build/esm/AlertCircle';
import Lock01 from '@untitled-ui/icons-react/build/esm/Lock01';
import Loading01 from '@untitled-ui/icons-react/build/esm/Loading01';

import Seo from '../components/Seo';
import Wordmark from '../components/Wordmark';
import { decodeInvoice, invoiceState, invoiceStatus, STATUS_LABEL } from '../lib/invoiceToken';
import { markInvoiceViewed, payInvoice, DEMO_TEST_CARDS, isDemo } from '../lib/dataSource';
import { formatMoney } from '../lib/format';
import { shootDate } from '../lib/tz';
import { site, policy } from '../data/site';

/* ===========================================================================
   Public invoice.
   ---------------------------------------------------------------------------
   Opened cold from a link Michael sent. No account, no login, possibly a
   different device from the one the booking was made on — so everything it
   needs is decoded from the token in the URL.

   Rendered outside the marketing chrome: someone paying an invoice is not
   browsing a portfolio.
   =========================================================================== */

const luhn = (num) => {
  const d = num.replace(/\D/g, '');
  if (d.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i -= 1) {
    let n = Number(d[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
};

const groupCard = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

export default function Invoice() {
  const { token } = useParams();
  const invoice = useMemo(() => decodeInvoice(token), [token]);

  const [state, setState] = useState(() => (invoice ? invoiceState.get(invoice.id) : null));
  const [card, setCard] = useState({ number: '', exp: '', cvc: '', name: '' });
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  /* Record the first open. This is the "viewed" signal the admin shows, and it
     is genuinely useful to a freelancer deciding whether to chase. */
  useEffect(() => {
    if (!invoice) return;
    markInvoiceViewed(invoice.id).then((r) => r.ok && setState(r.state));
  }, [invoice]);

  useEffect(() => invoiceState.subscribe((map) => invoice && setState(map[invoice.id] || null)), [invoice]);

  if (!invoice) {
    return (
      <>
        <Seo title="Invoice not found" />
        <main className="iv iv-empty">
          <div className="iv-shell">
            <Wordmark size="md" variant="type" />
            <h1 className="iv-title">This link doesn&rsquo;t work</h1>
            <p className="iv-lead">
              The link may have been cut short when it was copied — they are long, and some apps
              break them across lines. Ask Michael to send it again, and paste the whole thing.
            </p>
          </div>
        </main>
        <InvoiceStyles />
      </>
    );
  }

  const status = invoiceStatus(invoice, state);
  const paid = status === 'paid';
  const voided = status === 'cancelled';

  const validate = () => {
    const e = {};
    if (!card.name.trim()) e.name = 'Name on the card, please.';
    if (!luhn(card.number)) e.number = 'That card number doesn’t look right.';
    if (!/^\d{2}\s*\/\s*\d{2}$/.test(card.exp)) e.exp = 'Use MM / YY.';
    if (!/^\d{3,4}$/.test(card.cvc)) e.cvc = '3 or 4 digits.';
    return e;
  };

  const onPay = async () => {
    /* The declining test card must reach the stub to demonstrate the failure
       state, so it skips the Luhn gate. It is a valid Luhn number anyway. */
    const found = validate();
    setFieldErrors(found);
    if (Object.keys(found).length) return;

    setPaying(true);
    setError(null);
    const res = await payInvoice({ invoiceId: invoice.id, card, billingName: card.name });
    setPaying(false);
    if (!res.ok) {
      setError(res.message || 'That payment did not go through.');
      return;
    }
    setState(invoiceState.get(invoice.id));
  };

  const lineTotal = (l) => (l.amountCents || 0) * (l.quantity || 1);

  return (
    <>
      <Seo title={`Invoice ${invoice.number}`} />
      <main className="iv">
        <div className="iv-shell">
          {/* --- header --- */}
          <header className="iv-head">
            <Wordmark size="md" variant="type" to={null} />
            <div className="iv-head-meta">
              <span className={`badge ${status === 'paid' ? 'badge-ok' : status === 'overdue' ? 'badge-alert' : 'badge-info'}`}>
                {STATUS_LABEL[status]}
              </span>
              <span className="data iv-number">{invoice.number}</span>
            </div>
          </header>

          {/* --- paid receipt --- */}
          {paid && (
            <div className="iv-receipt">
              <span className="iv-receipt-icon" aria-hidden="true">
                <CheckCircle width={26} height={26} />
              </span>
              <div>
                <h1 className="iv-title">Paid</h1>
                <p className="iv-lead">
                  {formatMoney(invoice.amountDueCents)} received{' '}
                  {state?.paidAt ? `on ${shootDate(state.paidAt)}` : ''}. Michael has been notified
                  and your date is held.
                </p>
                <dl className="iv-receipt-rows">
                  <div>
                    <dt>Reference</dt>
                    <dd className="data">{state?.receiptRef || state?.intentId}</dd>
                  </div>
                  {state?.last4 && (
                    <div>
                      <dt>Card</dt>
                      <dd className="data">
                        {String(state.brand || 'card').toUpperCase()} ···· {state.last4}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {voided && (
            <p className="iv-void">
              <AlertCircle width={16} height={16} aria-hidden="true" />
              This invoice was cancelled. Nothing is owed on it.
            </p>
          )}

          {/* --- the invoice itself --- */}
          <section className="iv-doc plate">
            <div className="iv-doc-head">
              <div>
                <span className="plate-label">From</span>
                <p className="iv-strong">{site.name}</p>
                <p className="iv-muted">
                  {site.photographer} · {site.serviceArea.base}
                </p>
              </div>
              <div>
                <span className="plate-label">For</span>
                <p className="iv-strong">{invoice.customerName}</p>
                <p className="iv-muted">{invoice.customerEmail}</p>
              </div>
              <div>
                <span className="plate-label">Issued</span>
                <p className="iv-strong data">{shootDate(invoice.issuedAt)}</p>
                {invoice.dueDate && (
                  <p className={`iv-muted ${status === 'overdue' ? 'iv-overdue' : ''}`}>
                    Due {shootDate(invoice.dueDate)}
                  </p>
                )}
              </div>
            </div>

            <p className="iv-shoot">{invoice.title}</p>

            <table className="iv-lines">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col" className="iv-num">Qty</th>
                  <th scope="col" className="iv-num">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((l, i) => (
                  <tr key={`${l.description}-${i}`}>
                    <td>{l.description}</td>
                    <td className="iv-num data">{l.quantity || 1}</td>
                    <td className="iv-num data">{formatMoney(lineTotal(l))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colSpan={2}>Total</th>
                  <td className="iv-num data iv-total">{formatMoney(invoice.totalCents)}</td>
                </tr>
                <tr className="iv-due-row">
                  <th scope="row" colSpan={2}>
                    {invoice.kind === 'deposit' ? 'Due now (deposit)' : invoice.kind === 'balance' ? 'Balance due' : 'Due now'}
                  </th>
                  <td className="iv-num data iv-total">{formatMoney(invoice.amountDueCents)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* --- policy, before any card field --- */}
          {!paid && !voided && (
            <section className="iv-policy">
              <h2 className="iv-h2">{policy.headline}</h2>
              <ul>
                {policy.points.map((p) => (
                  <li key={p.title}>
                    <strong>{p.title}.</strong> {p.body}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* --- payment --- */}
          {!paid && !voided && (
            <section className="iv-pay plate">
              <h2 className="iv-h2">
                Pay {formatMoney(invoice.amountDueCents)}
              </h2>

              {isDemo && DEMO_TEST_CARDS.length > 0 && (
                <div className="iv-testcards">
                  <span className="plate-label">Demo only — this panel disappears in production</span>
                  <ul>
                    {DEMO_TEST_CARDS.map((c) => (
                      <li key={c.number}>
                        <button
                          type="button"
                          className="iv-testcard"
                          onClick={() =>
                            setCard({ number: c.number, exp: '12 / 30', cvc: '123', name: 'Casey Moreno' })
                          }
                        >
                          <span className="data">{c.number}</span>
                          <span>{c.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="iv-fields">
                <label className="iv-field iv-field-wide">
                  <span className="bk-label">Name on card</span>
                  <input
                    className="field-input"
                    autoComplete="cc-name"
                    value={card.name}
                    aria-invalid={Boolean(fieldErrors.name)}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                  />
                  {fieldErrors.name && <span className="iv-err" role="alert">{fieldErrors.name}</span>}
                </label>

                <label className="iv-field iv-field-wide">
                  <span className="bk-label">Card number</span>
                  <input
                    className="field-input data"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    aria-invalid={Boolean(fieldErrors.number)}
                    onChange={(e) => setCard({ ...card, number: groupCard(e.target.value) })}
                  />
                  {fieldErrors.number && <span className="iv-err" role="alert">{fieldErrors.number}</span>}
                </label>

                <label className="iv-field">
                  <span className="bk-label">Expiry</span>
                  <input
                    className="field-input data"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM / YY"
                    value={card.exp}
                    aria-invalid={Boolean(fieldErrors.exp)}
                    onChange={(e) => setCard({ ...card, exp: e.target.value })}
                  />
                  {fieldErrors.exp && <span className="iv-err" role="alert">{fieldErrors.exp}</span>}
                </label>

                <label className="iv-field">
                  <span className="bk-label">CVC</span>
                  <input
                    className="field-input data"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    value={card.cvc}
                    aria-invalid={Boolean(fieldErrors.cvc)}
                    onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  />
                  {fieldErrors.cvc && <span className="iv-err" role="alert">{fieldErrors.cvc}</span>}
                </label>
              </div>

              {error && (
                <p className="iv-error" role="alert">
                  <AlertCircle width={16} height={16} aria-hidden="true" />
                  {error}
                </p>
              )}

              <button type="button" className="btn btn-primary btn-lg iv-paybtn" onClick={onPay} disabled={paying}>
                {paying ? (
                  <>
                    <Loading01 className="bk-spin" width={16} height={16} aria-hidden="true" />
                    Taking payment
                  </>
                ) : (
                  `Pay ${formatMoney(invoice.amountDueCents)}`
                )}
              </button>

              <p className="iv-secure">
                <Lock01 width={13} height={13} aria-hidden="true" />
                {isDemo
                  ? 'Demo only. No card details are sent anywhere and nothing is charged.'
                  : 'Card details go straight to Stripe and never touch this site.'}
              </p>
            </section>
          )}

          <footer className="iv-foot">
            <p>
              Questions about this invoice? Reply to the message Michael sent you — it comes
              straight to him.
            </p>
          </footer>
        </div>
      </main>
      <InvoiceStyles />
    </>
  );
}

function InvoiceStyles() {
  return (
    <style>{`
      .iv { min-height: 100vh; background: var(--ground-deep); padding: var(--space-8) var(--space-4) var(--space-16); }
      .iv-shell { max-width: 660px; margin-inline: auto; display: grid; gap: var(--space-6); }
      .iv-empty { display: grid; place-items: center; }

      .iv-head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }
      .iv-head-meta { display: flex; align-items: center; gap: var(--space-3); }
      .iv-number { font-size: 0.85rem; color: var(--ink-soft); }

      .iv-title { font-family: var(--font-display); font-variation-settings: 'wdth' var(--wdth-display);
        font-weight: 800; text-transform: uppercase; font-size: clamp(1.6rem, 5vw, 2.2rem);
        line-height: 1; color: var(--ink); margin: 0 0 var(--space-2); }
      .iv-lead { margin: 0; color: var(--ink-soft); line-height: 1.6; }
      .iv-h2 { margin: 0 0 var(--space-4); font-size: 1.1rem; }

      .iv-receipt { display: flex; gap: var(--space-4); padding: var(--space-6);
        background: var(--ok-tint); border: 1px solid var(--ok-ink); border-radius: var(--radius-lg); }
      .iv-receipt-icon { color: var(--ok-ink); flex: none; }
      .iv-receipt .iv-title, .iv-receipt .iv-lead { color: var(--ok-ink); }
      .iv-receipt-rows { display: flex; flex-wrap: wrap; gap: var(--space-6); margin: var(--space-4) 0 0; }
      .iv-receipt-rows dt { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em;
        text-transform: uppercase; color: var(--ok-ink); opacity: 0.75; }
      .iv-receipt-rows dd { margin: 2px 0 0; font-size: 0.85rem; color: var(--ok-ink); font-weight: 600; }

      .iv-void { display: flex; align-items: center; gap: var(--space-2); margin: 0; padding: var(--space-4);
        background: var(--panel); border-radius: var(--radius); color: var(--ink-soft); }

      .iv-doc { padding: var(--space-6); }
      .iv-doc-head { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5);
        padding-bottom: var(--space-5); border-bottom: 1px solid var(--edge); }
      .iv-strong { margin: var(--space-2) 0 0; color: var(--ink); font-weight: 600; font-size: 0.92rem; }
      .iv-muted { margin: 2px 0 0; color: var(--ink-soft); font-size: 0.82rem; }
      .iv-overdue { color: var(--alert-ink); font-weight: 600; }

      .iv-shoot { margin: var(--space-5) 0; font-family: var(--font-display);
        font-variation-settings: 'wdth' var(--wdth-plate); font-weight: 700; text-transform: uppercase;
        font-size: 1.15rem; color: var(--ink); }

      .iv-lines { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
      .iv-lines th { text-align: left; font-family: var(--font-mono); font-size: 0.62rem;
        letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-soft);
        padding-bottom: var(--space-2); font-weight: 500; }
      .iv-lines td { padding: var(--space-3) 0; border-top: 1px solid var(--edge-hair); color: var(--ink-soft); }
      .iv-num { text-align: right; }
      .iv-lines tfoot th { padding-top: var(--space-4); font-size: 0.72rem; color: var(--ink); }
      .iv-lines tfoot td { padding-top: var(--space-4); border-top: 1px solid var(--edge-strong); }
      .iv-total { color: var(--ink); font-weight: 700; font-size: 1.05rem; }
      .iv-due-row th, .iv-due-row td { padding-top: var(--space-2); border-top: none; }
      .iv-due-row .iv-total { font-size: 1.3rem; }

      .iv-policy { padding: var(--space-5) var(--space-6); border: 1px solid var(--ink); border-radius: var(--radius-lg); }
      .iv-policy ul { margin: 0; padding-left: var(--space-5); display: grid; gap: var(--space-3); }
      .iv-policy li { color: var(--ink-soft); font-size: 0.88rem; line-height: 1.6; }
      .iv-policy strong { color: var(--ink); }

      .iv-pay { padding: var(--space-6); }
      .iv-testcards { margin-bottom: var(--space-5); padding: var(--space-4);
        background: var(--ground-deep); border: 1px dashed var(--edge-strong); border-radius: var(--radius); }
      .iv-testcards ul { list-style: none; margin: var(--space-3) 0 0; padding: 0; display: grid; gap: var(--space-2); }
      .iv-testcard { display: flex; justify-content: space-between; gap: var(--space-4); width: 100%;
        padding: var(--space-2) var(--space-3); background: var(--panel-high);
        border: 1px solid var(--edge); border-radius: var(--radius-sm);
        font-size: 0.8rem; color: var(--ink-soft); }
      .iv-testcard:hover { background: var(--ground); }

      .iv-fields { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-5); }
      .iv-field { display: grid; gap: var(--space-2); }
      .iv-field-wide { grid-column: 1 / -1; }
      .iv-err { font-size: 0.78rem; color: var(--alert-ink); font-weight: 500; }

      .iv-error { display: flex; align-items: center; gap: var(--space-2); margin: 0 0 var(--space-4);
        padding: var(--space-4); background: var(--alert-tint); color: var(--alert-ink);
        border-radius: var(--radius); font-size: 0.88rem; font-weight: 500; }

      .iv-paybtn { width: 100%; }
      .iv-secure { display: flex; align-items: center; justify-content: center; gap: var(--space-2);
        margin: var(--space-3) 0 0; font-size: 0.78rem; color: var(--ink-soft); text-align: center; }

      .iv-foot { text-align: center; }
      .iv-foot p { margin: 0; font-size: 0.82rem; color: var(--ink-soft); }
      .bk-spin { animation: bk-spin 0.9s linear infinite; }
      @keyframes bk-spin { to { transform: rotate(360deg); } }
      .bk-label { font-family: var(--font-mono); font-size: 0.66rem; font-weight: 500;
        letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-soft); }

      @media (max-width: 640px) {
        .iv-doc-head { grid-template-columns: 1fr; gap: var(--space-4); }
        .iv-fields { grid-template-columns: 1fr; }
        .iv-head { flex-direction: column; align-items: flex-start; }
      }
    `}</style>
  );
}
