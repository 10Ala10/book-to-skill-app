import { useEffect, useState } from "react";
import { listJobs, deleteJob } from "../api";
import type { Job } from "../api";

export function JobsList({ onSelect, refreshKey }: { onSelect: (id: string) => void; refreshKey: number }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  useEffect(() => {
    let alive = true;
    const tick = async () => { const j = await listJobs(); if (alive) setJobs(j); };
    tick();
    const t = setInterval(tick, 2000);
    return () => { alive = false; clearInterval(t); };
  }, [refreshKey]);

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {jobs.map(j => (
        <li key={j.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 0" }}>
          <button onClick={() => onSelect(j.id)} style={{ flex: 1, textAlign: "left" }}>
            {j.skill_name || j.filename} <em>[{j.status}]</em>
          </button>
          <button onClick={() => deleteJob(j.id)}>✕</button>
        </li>
      ))}
    </ul>
  );
}
