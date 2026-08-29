import { useState } from "react";
import { Upload } from "./components/Upload";
import { JobsList } from "./components/JobsList";
import { JobDetail } from "./components/JobDetail";

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, padding: 24, fontFamily: "system-ui" }}>
      <aside>
        <h1>book-to-skill</h1>
        <Upload onCreated={() => setRefreshKey(k => k + 1)} />
        <hr />
        <JobsList onSelect={setSelected} refreshKey={refreshKey} />
      </aside>
      <main>{selected ? <JobDetail id={selected} /> : <p>Select or upload a job.</p>}</main>
    </div>
  );
}
