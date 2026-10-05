import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "./servers.js";

export interface McpTool {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

export interface PlaygroundConnection {
  transport: Transport;
  url: string;
  tools: McpTool[];
  close: () => Promise<void>;
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Connect to an MCP server over SSE or Streamable HTTP and return a
 * live connection handle. Works in browsers and Node.
 */
export async function connectPlayground(
  url: string,
  transport: Transport
): Promise<PlaygroundConnection> {
  if (transport === "stdio") {
    throw new Error("stdio servers cannot be used in the browser playground");
  }
  const client = new Client({ name: "mcp-directory-playground", version: "0.1.0" });
  const t =
    transport === "sse"
      ? new SSEClientTransport(new URL(url))
      : new StreamableHTTPClientTransport(new URL(url));
  await client.connect(t);
  return wrapClient(client, transport, url);
}

/** Wrap a connected SDK client as a PlaygroundConnection (testable without network). */
export async function wrapClient(
  client: Client,
  transport: Transport,
  url: string
): Promise<PlaygroundConnection> {
  const listed = await client.listTools();
  const tools: McpTool[] = (listed.tools ?? []).map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema as Record<string, unknown>,
  }));

  return {
    transport,
    url,
    tools,
    close: () => client.close(),
    callTool: async (name, args) => {
      const res = await client.callTool({ name, arguments: args });
      return res;
    },
  };
}

/** Guess the transport from a URL when the user pastes one without metadata. */
export function inferTransport(url: string): Transport {
  const u = url.toLowerCase();
  if (u.includes("/sse")) return "sse";
  return "streamable-http";
}
