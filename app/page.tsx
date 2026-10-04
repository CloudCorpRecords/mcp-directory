import { getServers } from "../lib/servers";

export default function Home() {
  const servers = getServers();
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
      <h1>MCP Directory</h1>
      <p>
        Discover Model Context Protocol servers. Every server with a public
        endpoint gets a live playground — try its tools without installing
        anything.
      </p>
      {servers.map((s) => (
        <article
          key={s.id}
          style={{ border: "1px solid #333", borderRadius: 8, padding: 16, margin: "16px 0" }}
        >
          <h2>{s.name}</h2>
          <p>{s.description}</p>
          <p>
            <small>
              by {s.author} · {s.transport} · ⭐ {s.stars}
            </small>
          </p>
          <p>
            <code>{s.command}</code>
          </p>
        </article>
      ))}
    </main>
  );
}
