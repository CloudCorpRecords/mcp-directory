"use client";

import { useState } from "react";
import {
  connectPlayground,
  inferTransport,
  type McpTool,
  type PlaygroundConnection,
} from "@/lib/mcp-client";
import type { Transport } from "@/lib/servers";

export default function Playground({
  initialUrl,
  initialTransport,
}: {
  initialUrl?: string | null;
  initialTransport?: Transport;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [transport, setTransport] = useState<Transport>(initialTransport ?? "streamable-http");
  const [conn, setConn] = useState<PlaygroundConnection | null>(null);
  const [tools, setTools] = useState<McpTool[]>([]);
  const [selected, setSelected] = useState("");
  const [args, setArgs] = useState("{}");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tool = tools.find((t) => t.name === selected);

  async function onConnect() {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const c = await connectPlayground(url.trim(), transport);
      setConn(c);
      setTools(c.tools);
      setSelected(c.tools[0]?.name ?? "");
      if (c.tools[0]) {
        const props = (c.tools[0].inputSchema as any)?.properties ?? {};
        const template: Record<string, unknown> = {};
        for (const k of Object.keys(props)) template[k] = "";
        setArgs(JSON.stringify(template, null, 2));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onDisconnect() {
    await conn?.close().catch(() => {});
    setConn(null);
    setTools([]);
    setResult(null);
  }

  async function onCall() {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const parsed = JSON.parse(args);
      const res = await conn!.callTool(selected, parsed);
      setResult(JSON.stringify(res, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function onUrlChange(v: string) {
    setUrl(v);
    if (!initialUrl) setTransport(inferTransport(v));
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>⚡ Live playground</h3>
      {!conn ? (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "3 1 280px" }}>
            <input type="text" placeholder="https://your-server.example/mcp" value={url} onChange={(e) => onUrlChange(e.target.value)} />
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <select value={transport} onChange={(e) => setTransport(e.target.value as Transport)}>
              <option value="streamable-http">Streamable HTTP</option>
              <option value="sse">SSE</option>
            </select>
          </div>
          <button className="btn" disabled={busy || !url.trim()} onClick={onConnect}>
            {busy ? "Connecting…" : "Connect"}
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: "#166534" }}>Connected to <code>{url}</code> — {tools.length} tool{tools.length === 1 ? "" : "s"} found.</p>
          <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                {tools.map((t) => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-secondary" onClick={onDisconnect}>Disconnect</button>
          </div>
          {tool?.description && <p style={{ color: "#555" }}>{tool.description}</p>}
          {tool && (
            <details style={{ marginBottom: 12 }}>
              <summary style={{ cursor: "pointer" }}>Input schema</summary>
              <pre>{JSON.stringify(tool.inputSchema, null, 2)}</pre>
            </details>
          )}
          <label>Arguments (JSON)</label>
          <textarea rows={6} value={args} onChange={(e) => setArgs(e.target.value)} style={{ fontFamily: "monospace" }} />
          <div style={{ marginTop: 12 }}>
            <button className="btn" disabled={busy || !selected} onClick={onCall}>
              {busy ? "Calling…" : "Call tool"}
            </button>
          </div>
        </div>
      )}
      {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 12 }}>
          <label>Result</label>
          <pre>{result}</pre>
        </div>
      )}
      <p style={{ fontSize: 12, color: "#888", marginBottom: 0 }}>
        The playground calls the server directly from your browser — no data passes through this site.
      </p>
    </div>
  );
}
