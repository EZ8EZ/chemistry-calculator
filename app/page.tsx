export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "3rem", maxWidth: 640 }}>
      <h1>Chem Digest</h1>
      <p>
        This is a backend-only service. It has no user-facing dashboard — it
        ingests chemistry papers/preprints on a schedule, scores relevance
        with Claude, and emails a daily digest to configured recipients.
      </p>
      <p>
        Health check: <a href="/api/health">/api/health</a>
      </p>
    </main>
  );
}
