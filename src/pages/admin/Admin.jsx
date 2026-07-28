/* PLACEHOLDER PAGE — replaced by the real dashboard in a later build stage.
   Exists now only so the /admin route resolves and the bundle splits correctly. */
export default function Admin() {
  return (
    <div className="ad-stub">
      <p>Dashboard — next build stage.</p>
      <style>{`
        .ad-stub {
          display: grid;
          place-items: center;
          min-height: 100vh;
          color: var(--text-faint);
          font-size: 0.9rem;
          background: var(--bg);
        }
      `}</style>
    </div>
  );
}
