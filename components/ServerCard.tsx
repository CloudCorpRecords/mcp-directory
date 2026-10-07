import Link from "next/link";
import type { McpServerEntry } from "@/lib/servers";

export default function ServerCard({ server }: { server: McpServerEntry }) {
  return (
    <Link href={`/server/${server.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="card" style={{ height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: "0 0 8px" }}>{server.name}</h3>
          {server.featured && <span className="tag">featured</span>}
        </div>
        <p style={{ color: "#555", fontSize: 14, margin: "0 0 12px" }}>{server.description}</p>
        <div>
          {server.capabilities.slice(0, 4).map((c) => (
            <span key={c} className="tag">{c}</span>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "#888", margin: "12px 0 0" }}>
          by {server.author} · {server.transport}
          {server.playgroundUrl ? " · try it live ⚡" : ""}
        </p>
      </div>
    </Link>
  );
}
