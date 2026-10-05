import "./globals.css";
export const metadata = { title: "MCP Directory — find and try MCP servers", description: "Searchable directory of Model Context Protocol servers with a live in-browser playground." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
