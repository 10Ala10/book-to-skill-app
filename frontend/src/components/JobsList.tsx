import { useEffect, useState } from "react";
import { listJobs, deleteJob } from "../api";
import type { Job } from "../api";

export function JobsList({ onSelect, onDeleted, refreshKey }: { onSelect: (id: string) => void; onDeleted: (id: string) => void; refreshKey: number }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  useEffect(() => {
    let alive = true;
    let timer: number | undefined;
    const tick = async () => {
      try {
        const j = await listJobs();
        if (!alive) return;
        setJobs(j);
        const active = j.length === 0 || j.some(x => x.status === "queued" || x.status === "running");
        if (active) timer = window.setTimeout(tick, 2000);
      } catch { /* transient error; stop polling */ }
    };
    tick();
    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, [refreshKey]);

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {jobs.map(j => (
        <li key={j.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 0" }}>
          <button onClick={() => onSelect(j.id)} style={{ flex: 1, textAlign: "left" }}>
            {j.skill_name || j.filename} <em>[{j.status}]</em>
          </button>
          <button onClick={async () => { await deleteJob(j.id); onDeleted(j.id); }}>✕</button>
        </li>
      ))}
    </ul>
  );
}
