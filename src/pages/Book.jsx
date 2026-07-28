import Seo from '../components/Seo';

/* PLACEHOLDER PAGE — replaced by the multi-step booking wizard in the next
   build stage. It exists now only so the route resolves and the rest of the
   site is navigable end to end. Do not ship this to the client. */
export default function Book() {
  return (
    <>
      <Seo title="Book a shoot" />
      <section className="bk-stub">
        <div className="wrap">
          <h1 className="display bk-stub-title">Booking</h1>
          <p className="bk-stub-note">
            The booking wizard is the next build stage. This placeholder keeps the route live so the
            rest of the site can be reviewed.
          </p>
        </div>
      </section>
      <style>{`
        .bk-stub { padding-block: var(--space-24); }
        .bk-stub-title { font-size: clamp(2.5rem, 8vw, 4.5rem); margin: 0 0 var(--space-4); }
        .bk-stub-note {
          margin: 0;
          max-width: 56ch;
          color: var(--text-muted);
          padding: var(--space-4) var(--space-5);
          border: 1.5px dashed var(--border-light);
          border-radius: var(--radius);
          background: var(--surface);
        }
      `}</style>
    </>
  );
}
