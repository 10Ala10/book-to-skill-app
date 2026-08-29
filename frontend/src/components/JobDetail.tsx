import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getJob, getLog, getFiles, fileUrl, downloadUrl } from "../api";
import type { Job, Node } from "../api";
import { FileTree } from "./FileTree";

export function JobDetail({ id }: { id: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [log, setLog] = useState("");
  const [tree, setTree] = useState<Node[]>([]);
  const [content, setContent] = useState<{ path: string; text: string } | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const j = await getJob(id); if (!alive) return; setJob(j);
      if (j.status === "running" || j.status === "queued") setLog(await getLog(id));
      if (j.status === "done") setTree(await getFiles(id));
      if (j.status === "error") setLog(await getLog(id));
    };
    tick();
    const t = setInterval(tick, 2000);
    return () => { alive = false; clearInterval(t); };
  }, [id]);

  async function pick(path: string) {
    const text = await fetch(fileUrl(id, path)).then(r => r.text());
    setContent({ path, text });
  }

  if (!job) return <p>Loading…</p>;
  return (
    <div>
      <h2>{job.skill_name || job.filename} — {job.status}</h2>
      {(job.status === "queued" || job.status === "running") &&
        <pre style={{ background: "#111", color: "#0f0", padding: 8, overflow: "auto", maxHeight: 400 }}>{log || "…"}</pre>}
      {job.status === "error" &&
        <><p style={{ color: "crimson" }}>{job.error}</p><pre>{log}</pre></>}
      {job.status === "done" && (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
          <div>
            <a href={downloadUrl(id)}>⬇ Download zip</a>
            <FileTree nodes={tree} onPick={pick} />
          </div>
          <div>
            {content
              ? content.path.endsWith(".md")
                ? <ReactMarkdown>{content.text}</ReactMarkdown>
                : <pre style={{ whiteSpace: "pre-wrap" }}>{content.text}</pre>
              : <p>Pick a file.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
