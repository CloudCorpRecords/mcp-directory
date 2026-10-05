import Link from "next/link";
import { notFound } from "next/navigation";
import { loadCatalog, installInstructions } from "@/lib/servers";
import Playground from "@/components/Playground";
import catalogJson from "@/data/servers.json";

export function generateStaticParams() {
  return loadCatalog(JSON.stringify(catalogJson)).map((e) => ({ id: e.id }));
}

export default function ServerPage({ params }: { params: { id: string } }) {
  const entries = loadCatalog(JSON.stringify(catalogJson));
  const server = entries.find((e) => e.id === params.id);
  if (!server) notFound();
  const instructions = installInstructions(server).join("\n");

  return (
    <div className="container">
      <p><Link href="/">← All servers</Link></p>
      <h1>{server.name}</h1>
      <p style={{ color: "#555" }}>{server.description}</p>
      <div style={{ marginBottom: 16 }}>
        {server.capabilities.map((c) => (
          <span key={c} className="tag">{c}</span>
        ))}
      </div>
      <p style={{ fontSize: 14, color: "#666" }}>
        by {server.author} · <a href={server.repo} target="_blank" rel="noreferrer">source</a> · transport: {server.transport} · runtime: {server.runtime}
      </p>

      <div style={{ margin: "24px 0" }}>
        {server.playgroundUrl || server.transport !== "stdio" ? (
          <Playground initialUrl={server.playgroundUrl} initialTransport={server.transport === "stdio" ? undefined : server.transport} />
        ) : (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Install</h3>
            <pre>{server.command}</pre>
            <p style={{ fontSize: 14, color: "#555" }}>
              This server runs over stdio, so it can't be tried in the browser — but you can paste any
              SSE or Streamable HTTP endpoint below to try it live.
            </p>
            <Playground />
          </div>
        )}
      </div>

      <h2>Setup instructions</h2>
      <pre>{instructions}</pre>
    </div>
  );
}
