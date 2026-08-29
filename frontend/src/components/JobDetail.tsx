import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { DownloadSimple, WarningCircle, Terminal, FileDashed } from "@phosphor-icons/react";
import { getJob, getLog, getFiles, fileUrl, downloadUrl } from "../api";
import type { Job, Node } from "../api";
import { FileTree } from "./FileTree";
import { StatusPill } from "./Status";

export function JobDetail({ id }: { id: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [log, setLog] = useState("");
  const [tree, setTree] = useState<Node[]>([]);
  const [content, setContent] = useState<{ path: string; text: string } | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: number | undefined;
    setJob(null); setLog(""); setTree([]); setContent(null);
    const tick = async () => {
      try {
        const j = await getJob(id); if (!alive) return; setJob(j);
        if (j.status === "running" || j.status === "queued") setLog(await getLog(id));
        if (j.status === "done") setTree(await getFiles(id));
        if (j.status === "error") setLog(await getLog(id));
        const active = j.status === "queued" || j.status === "running";
        if (active) timer = window.setTimeout(tick, 2000);
      } catch { /* job deleted or transient error; stop polling */ }
    };
    tick();
    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, [id]);

  async function pick(path: string) {
    const text = await fetch(fileUrl(id, path)).then(r => r.text());
    setContent({ path, text });
  }

  if (!job) {
    return (
      <div className="skeleton" style={{ maxWidth: 620 }}>
        <div className="sk title" />
        <div className="sk w90" />
        <div className="sk w70" />
        <div className="sk w50" />
      </div>
    );
  }

  return (
    <div>
      <div className="detail-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="detail-title">{job.skill_name || job.filename}</h1>
          <div className="detail-sub">{job.filename}</div>
        </div>
        <StatusPill status={job.status} />
        {job.status === "done" && (
          <a className="btn btn-ghost" href={downloadUrl(id)}>
            <DownloadSimple size={16} weight="bold" />
            Download .zip
          </a>
        )}
      </div>

      {(job.status === "queued" || job.status === "running") && (
        <div>
          <div className="terminal-head">
            <Terminal size={13} weight="bold" />
            {job.status === "queued" ? "Waiting to start" : "Converting"}
          </div>
          <pre className="terminal">{log || "Starting the converter…"}</pre>
        </div>
      )}

      {job.status === "error" && (
        <div>
          <div className="error-card">
            <WarningCircle size={18} weight="fill" style={{ flex: "none" }} />
            <div className="ec-body">{job.error || "Conversion failed."}</div>
          </div>
          <div className="terminal-head">
            <Terminal size={13} weight="bold" />
            Run log
          </div>
          <pre className="terminal">{log}</pre>
        </div>
      )}

      {job.status === "done" && (
        <div className="result">
          <aside className="result-aside">
            <div className="panel tree-panel">
              <FileTree nodes={tree} onPick={pick} selected={content?.path ?? null} />
            </div>
          </aside>
          <div className="viewer">
            {content ? (
              content.path.endsWith(".md") ? (
                <div className="prose"><ReactMarkdown>{content.text}</ReactMarkdown></div>
              ) : (
                <pre className="raw">{content.text}</pre>
              )
            ) : (
              <div className="viewer-empty">
                <FileDashed size={26} weight="duotone" />
                <div className="empty-title">Pick a file</div>
                <div className="empty-hint">Select a file from the generated skill to preview it here.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
