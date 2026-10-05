"use client";

import { useMemo, useState } from "react";
import ServerCard from "@/components/ServerCard";
import { searchCatalog, allCapabilities, type McpServerEntry } from "@/lib/servers";

export default function DirectoryHome({ entries }: { entries: McpServerEntry[] }) {
  const [query, setQuery] = useState("");
  const [capability, setCapability] = useState("");
  const [transport, setTransport] = useState("");

  const caps = useMemo(() => allCapabilities(entries), [entries]);
  const results = useMemo(
    () =>
      searchCatalog(entries, {
        query,
        capability: capability || undefined,
        transport: (transport as "stdio" | "sse" | "streamable-http") || undefined,
      }),
    [entries, query, capability, transport]
  );

  return (
    <div className="container">
      <h1>MCP Directory</h1>
      <p>Find Model Context Protocol servers — and try the HTTP ones live, right in your browser.</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: "2 1 240px" }}>
          <input
            type="text"
            placeholder="Search servers, capabilities, authors…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div style={{ flex: "1 1 160px" }}>
          <select value={capability} onChange={(e) => setCapability(e.target.value)}>
            <option value="">All capabilities</option>
            {caps.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: "1 1 160px" }}>
          <select value={transport} onChange={(e) => setTransport(e.target.value)}>
            <option value="">All transports</option>
            <option value="stdio">stdio</option>
            <option value="sse">SSE</option>
            <option value="streamable-http">Streamable HTTP</option>
          </select>
        </div>
      </div>

      <p style={{ color: "#666" }}>{results.length} server{results.length === 1 ? "" : "s"}</p>
      <div className="grid">
        {results.map((s) => (
          <ServerCard key={s.id} server={s} />
        ))}
      </div>
      {results.length === 0 && <p>No servers match. Try a different search.</p>}
    </div>
  );
}
