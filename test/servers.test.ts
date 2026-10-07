import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadCatalog,
  validateEntry,
  searchCatalog,
  allCapabilities,
  installInstructions,
} from "../lib/servers.js";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..");
const raw = readFileSync(join(dir, "data", "servers.json"), "utf8");

describe("catalog data", () => {
  it("loads and validates the real servers.json", () => {
    const entries = loadCatalog(raw);
    assert.ok(entries.length >= 10, `expected 10+ servers, got ${entries.length}`);
  });
  it("has no duplicate ids", () => {
    const entries = loadCatalog(raw);
    assert.equal(new Set(entries.map((e) => e.id)).size, entries.length);
  });
});

describe("validateEntry", () => {
  it("rejects missing fields", () => {
    const { valid, errors } = validateEntry({ id: "x" });
    assert.equal(valid, false);
    assert.ok(errors.some((e) => e.includes("missing required field")));
  });
  it("rejects bad ids and transports", () => {
    assert.equal(validateEntry({ id: "Bad_ID", name: "n", description: "d", author: "a", repo: "r", runtime: "npx", command: "c", transport: "stdio", capabilities: [] }).valid, false);
  });
  it("rejects playgroundUrl on stdio servers", () => {
    const { valid } = validateEntry({ id: "x", name: "n", description: "d", author: "a", repo: "r", runtime: "npx", command: "c", transport: "stdio", capabilities: [], playgroundUrl: "https://x" });
    assert.equal(valid, false);
  });
  it("accepts a complete stdio entry", () => {
    const { valid, errors } = validateEntry({ id: "my-server", name: "n", description: "d", author: "a", repo: "r", runtime: "npx", command: "c", transport: "stdio", capabilities: ["x"], playgroundUrl: null });
    assert.equal(valid, true, errors.join("; "));
  });
});

describe("searchCatalog", () => {
  const entries = loadCatalog(raw);
  it("finds by name substring", () => {
    const hits = searchCatalog(entries, { query: "postgres" });
    assert.equal(hits.length, 1);
    assert.equal(hits[0].id, "postgres");
  });
  it("filters by capability", () => {
    const hits = searchCatalog(entries, { capability: "database" });
    assert.ok(hits.length >= 2);
    assert.ok(hits.every((h) => h.capabilities.includes("database")));
  });
  it("featured sort first", () => {
    const hits = searchCatalog(entries, {});
    assert.equal(hits[0].featured, true);
  });
  it("returns empty on no match", () => {
    assert.deepEqual(searchCatalog(entries, { query: "zzz-no-such-server" }), []);
  });
});

describe("allCapabilities", () => {
  it("returns a sorted unique list", () => {
    const caps = allCapabilities(loadCatalog(raw));
    assert.ok(caps.includes("database"));
    assert.deepEqual(caps, [...caps].sort());
    assert.equal(new Set(caps).size, caps.length);
  });
});

describe("installInstructions", () => {
  it("includes the command and an MCP config snippet for stdio", () => {
    const [entry] = loadCatalog(raw).filter((e) => e.id === "filesystem");
    const text = installInstructions(entry).join("\n");
    assert.match(text, /npx -y @modelcontextprotocol\/server-filesystem/);
    assert.match(text, /mcpServers/);
  });
});
