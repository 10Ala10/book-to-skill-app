import { useState } from "react";
import { Books } from "@phosphor-icons/react";
import { Upload } from "./components/Upload";
import { JobsList } from "./components/JobsList";
import { JobDetail } from "./components/JobDetail";

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Books size={19} weight="fill" />
          </div>
          <div>
            <div className="brand-name">book&#8202;to&#8202;skill</div>
            <div className="brand-sub">Documents into agent skills</div>
          </div>
        </div>

        <div className="sidebar-scroll">
          <section>
            <h2 className="section-label">New conversion</h2>
            <Upload onCreated={() => setRefreshKey((k) => k + 1)} />
          </section>

          <section>
            <h2 className="section-label">Conversions</h2>
            <JobsList
              selected={selected}
              onSelect={setSelected}
              onDeleted={(id) => {
                if (selected === id) setSelected(null);
                setRefreshKey((k) => k + 1);
              }}
              refreshKey={refreshKey}
            />
          </section>
        </div>
      </aside>

      <main className="main">
        {selected ? (
          <JobDetail id={selected} />
        ) : (
          <div className="empty" style={{ marginTop: "12vh" }}>
            <Books size={30} weight="duotone" />
            <div className="empty-title">No conversion selected</div>
            <div className="empty-hint">
              Upload a document on the left, or pick a past conversion to view its
              generated skill.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
