import servers from "../data/servers.json";

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  author: string;
  repo: string;
  runtime: string;
  command?: string;
  transport: "stdio" | "sse" | "streamable-http";
  playgroundUrl: string | null;
  capabilities: string[];
  stars: number;
}

export function getServers(): MCPServer[] {
  return servers as MCPServer[];
}

export function getServer(id: string): MCPServer | undefined {
  return getServers().find((s) => s.id === id);
}

export function searchServers(query: string): MCPServer[] {
  const q = query.toLowerCase();
  return getServers().filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.capabilities.some((c) => c.toLowerCase().includes(q))
  );
}
