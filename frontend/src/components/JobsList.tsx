import { useEffect, useState } from "react";
import { Trash, Tray } from "@phosphor-icons/react";
import { listJobs, deleteJob } from "../api";
import type { Job } from "../api";
import { StatusPill } from "./Status";

export function JobsList({ selected, onSelect, onDeleted, refreshKey }: { selected: string | null; onSelect: (id: string) => void; onDeleted: (id: string) => void; refreshKey: number }) {
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

  if (jobs.length === 0) {
    return (
      <div className="empty" style={{ padding: "32px 16px" }}>
        <Tray size={26} weight="duotone" />
        <div className="empty-hint">No conversions yet. Upload a document to start.</div>
      </div>
    );
  }

  return (
    <ul className="jobs">
      {jobs.map(j => (
        <li
          key={j.id}
          className={`job-row${selected === j.id ? " active" : ""}`}
          onClick={() => onSelect(j.id)}
        >
          <div className="job-meta">
            <div className="job-name">{j.skill_name || j.filename}</div>
            <div className="job-sub">{j.skill_name ? j.filename : j.book_type}</div>
          </div>
          <StatusPill status={j.status} />
          <button
            className="btn-icon danger"
            aria-label="Delete conversion"
            onClick={async (e) => { e.stopPropagation(); await deleteJob(j.id); onDeleted(j.id); }}
          >
            <Trash size={15} />
          </button>
        </li>
      ))}
    </ul>
  );
}
