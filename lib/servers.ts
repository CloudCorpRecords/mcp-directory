export type Transport = "stdio" | "sse" | "streamable-http";
export type Runtime = "npx" | "uvx" | "docker" | "binary";

export interface McpServerEntry {
  id: string;
  name: string;
  description: string;
  author: string;
  repo: string;
  runtime: Runtime;
  command: string;
  transport: Transport;
  /** public SSE / Streamable HTTP endpoint for the live playground; null = install only */
  playgroundUrl: string | null;
  capabilities: string[];
  featured?: boolean;
}

const REQUIRED: (keyof McpServerEntry)[] = [
  "id",
  "name",
  "description",
  "author",
  "repo",
  "runtime",
  "command",
  "transport",
  "capabilities",
];

export function validateEntry(e: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (typeof e !== "object" || e === null) {
    return { valid: false, errors: ["entry must be an object"] };
  }
  const obj = e as Record<string, unknown>;
  for (const k of REQUIRED) {
    if (obj[k] === undefined || obj[k] === null || obj[k] === "") {
      errors.push(`missing required field: ${k}`);
    }
  }
  if (obj.id !== undefined && !/^[a-z0-9-]+$/.test(String(obj.id))) {
    errors.push(`id must be kebab-case: ${obj.id}`);
  }
  if (obj.transport !== undefined && !["stdio", "sse", "streamable-http"].includes(String(obj.transport))) {
    errors.push(`invalid transport: ${obj.transport}`);
  }
  if (obj.playgroundUrl && obj.transport === "stdio") {
    errors.push("stdio servers cannot have a playgroundUrl");
  }
  if (obj.transport !== "stdio" && !obj.playgroundUrl) {
    errors.push("non-stdio servers should provide a playgroundUrl");
  }
  return { valid: errors.length === 0, errors };
}

export function loadCatalog(json: string): McpServerEntry[] {
  const parsed: unknown = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error("catalog must be a JSON array");
  const ids = new Set<string>();
  return parsed.map((e, i) => {
    const { valid, errors } = validateEntry(e);
    if (!valid) throw new Error(`entry ${i}: ${errors.join("; ")}`);
    const entry = e as McpServerEntry;
    if (ids.has(entry.id)) throw new Error(`duplicate id: ${entry.id}`);
    ids.add(entry.id);
    return entry;
  });
}

export interface SearchFilters {
  query?: string;
  capability?: string;
  transport?: Transport;
  featuredOnly?: boolean;
}

export function searchCatalog(entries: McpServerEntry[], f: SearchFilters): McpServerEntry[] {
  const q = (f.query ?? "").trim().toLowerCase();
  return entries
    .filter((e) => {
      if (f.featuredOnly && !e.featured) return false;
      if (f.transport && e.transport !== f.transport) return false;
      if (f.capability && !e.capabilities.includes(f.capability)) return false;
      if (q) {
        const hay = `${e.name} ${e.description} ${e.author} ${e.capabilities.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || a.name.localeCompare(b.name));
}

export function allCapabilities(entries: McpServerEntry[]): string[] {
  return [...new Set(entries.flatMap((e) => e.capabilities))].sort();
}

export function installInstructions(e: McpServerEntry): string[] {
  const lines = [`# ${e.name}`, "", e.description, "", "## Install", "", "```bash", e.command, "```", ""];
  if (e.transport === "stdio") {
    lines.push("Add to your MCP client config:", "", "```json", JSON.stringify({ mcpServers: { [e.id]: { command: e.command.split(" ")[0], args: e.command.split(" ").slice(1) } } }, null, 2), "```");
  } else {
    lines.push(`Connect the playground (or your client) to: \`${e.playgroundUrl}\``);
  }
  return lines;
}
