# MCP Directory + Live Playground

A searchable directory of MCP (Model Context Protocol) servers where every listing has a **"Try it live"** button — connect to the server and call its tools right in the browser, no install needed.

## Why this exists

MCP is the standard way to give AI agents new capabilities, but discovery is broken: servers are scattered across GitHub repos, blog posts, and Discord messages. This is the directory + playground the ecosystem needs.

## For AI builders (read this first)

This repo is designed to be built and extended by AI coding assistants. The architecture is deliberately simple:

- **Frontend:** Next.js 14 (App Router) + Tailwind, deployed on Vercel
- **Directory data:** `data/servers.json` — the entire catalog is one JSON file; adding a server = adding an object
- **Playground:** browser-side MCP client using `@modelcontextprotocol/sdk` — connects to any server with an SSE or Streamable HTTP endpoint and lists/calls its tools
- **No backend required for v1** — the playground runs entirely client-side; listings are static

## Repo structure

```
mcp-directory/
├── app/
│   ├── page.tsx              # directory homepage (search + grid)
│   ├── server/[id]/page.tsx  # server detail page + embedded playground
│   └── layout.tsx
├── components/
│   ├── ServerCard.tsx        # listing card
│   ├── SearchBar.tsx         # filter by name, capability, runtime
│   └── Playground.tsx        # ← the core: connect + list tools + call tool
├── lib/
│   ├── servers.ts            # loads + validates data/servers.json
│   └── mcp-client.ts         # thin wrapper around the MCP SDK client
├── data/
│   └── servers.json          # the catalog (see schema below)
└── public/
```

## `servers.json` schema

```json
{
  "id": "filesystem",
  "name": "Filesystem",
  "description": "Read/write local files",
  "author": "Anthropic",
  "repo": "https://github.com/modelcontextprotocol/servers",
  "runtime": "npx",
  "command": "npx @modelcontextprotocol/server-filesystem /tmp",
  "transport": "stdio",
  "playgroundUrl": null,
  "capabilities": ["files", "local"],
  "stars": 1200
}
```

For the playground, `transport` can be `sse` or `streamable-http` with a public `playgroundUrl`. `stdio` servers show install instructions instead of a live button.

## Status: v1 built and tested

The full app is implemented, typechecked, and covered by tests (`npm test` — 19/19 passing), and the production build is verified:

- **Catalog** (`data/servers.json`) — 15 real MCP servers with validated schema (kebab-case ids, transport rules enforced)
- **Library** (`lib/`) — `servers.ts` (load/validate/search/filter/install-instructions), `mcp-client.ts` (browser MCP client: connect → list tools → call tool, over SSE or Streamable HTTP)
- **UI** — searchable/filterable directory homepage, 15 statically-generated server detail pages, each with install instructions
- **Playground** — every detail page embeds the live playground: paste any SSE/Streamable-HTTP endpoint, list its tools, inspect schemas, call tools with a JSON editor, see results. Calls go straight from the browser to the server — nothing passes through this site.

Verified: `next build` succeeds (15 static detail pages); production server smoke-tested (homepage, detail page, filters all render); MCP client tested over a real in-memory MCP protocol pair (list + call + error paths).

Tests: `npm test` · Typecheck: `npx tsc --noEmit` · Build: `npm run build`

Note: the seed catalog intentionally has no `playgroundUrl` values — the well-known public servers are stdio-only. The playground accepts any user-provided HTTP endpoint, which is the honest v1.

## Tech stack

`TypeScript` `Next.js` `Tailwind` `@modelcontextprotocol/sdk` `Vercel`

## Roadmap

- [ ] v1: catalog + search + detail pages
- [ ] v2: live playground for SSE/HTTP servers
- [ ] v3: crowdsourced submissions via PR
- [ ] v4: ratings, usage stats, "verified" badges

## Contributing

PRs welcome — especially new server listings. Add your server to `data/servers.json` following the schema above.

## License

MIT

