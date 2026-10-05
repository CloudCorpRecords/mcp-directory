import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { z } from "zod";
import { connectPlayground, wrapClient, inferTransport } from "../lib/mcp-client.js";

async function linkedPair() {
  const [clientT, serverT] = InMemoryTransport.createLinkedPair();
  const server = new McpServer({ name: "test-server", version: "1.0.0" });
  server.tool("echo", { text: z.string() }, async ({ text }) => ({
    content: [{ type: "text", text: `echo:${text}` }],
  }));
  server.tool("noargs", {}, async () => ({ content: [{ type: "text", text: "ok" }] }));
  await server.connect(serverT);
  const client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(clientT);
  return { client, server };
}

describe("wrapClient over a real MCP protocol pair", () => {
  it("lists tools from the server", async () => {
    const { client } = await linkedPair();
    const conn = await wrapClient(client, "streamable-http", "https://example.test/mcp");
    const names = conn.tools.map((t) => t.name).sort();
    assert.deepEqual(names, ["echo", "noargs"]);
    await conn.close();
  });
  it("calls a tool and returns the result", async () => {
    const { client } = await linkedPair();
    const conn = await wrapClient(client, "streamable-http", "https://example.test/mcp");
    const res: any = await conn.callTool("echo", { text: "hello" });
    const text = res.content.map((c: any) => c.text).join("");
    assert.equal(text, "echo:hello");
    await conn.close();
  });
  it("surfaces server-side tool errors", async () => {
    const { client } = await linkedPair();
    const conn = await wrapClient(client, "streamable-http", "https://example.test/mcp");
    const res: any = await conn.callTool("echo", {});
    assert.equal(res.isError, true);
    await conn.close();
  });
});

describe("connectPlayground", () => {
  it("refuses stdio servers", async () => {
    await assert.rejects(
      connectPlayground("https://example.test", "stdio"),
      /cannot be used in the browser/
    );
  });
  it("fails cleanly on unreachable URLs", async () => {
    await assert.rejects(
      connectPlayground("http://127.0.0.1:9/nope", "streamable-http"),
      /fetch failed|ECONNREFUSED/
    );
  });
});

describe("inferTransport", () => {
  it("detects /sse paths", () => {
    assert.equal(inferTransport("https://x.test/sse"), "sse");
  });
  it("defaults to streamable-http", () => {
    assert.equal(inferTransport("https://x.test/mcp"), "streamable-http");
  });
});
