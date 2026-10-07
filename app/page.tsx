import { loadCatalog } from "@/lib/servers";
import DirectoryHome from "@/components/DirectoryHome";
import catalogJson from "@/data/servers.json";

export default function Page() {
  const entries = loadCatalog(JSON.stringify(catalogJson));
  return <DirectoryHome entries={entries} />;
}
