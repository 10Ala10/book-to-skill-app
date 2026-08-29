import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { DownloadSimple, WarningCircle, Terminal, FileDashed, CircleNotch } from "@phosphor-icons/react";
import { getJob, getLog, getFiles, fileUrl, downloadUrl } from "../api";
import type { Job, Node } from "../api";
import { FileTree } from "./FileTree";
import { StatusPill } from "./Status";

function countFiles(nodes: Node[]): number {
  return nodes.reduce((n, x) => n + (x.type === "file" ? 1 : countFiles(x.children ?? [])), 0);
}
function fmtDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m ? `${m}m ${r}s` : `${r}s`;
}

export function JobDetail({ id }: { id: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [log, setLog] = useState("");
  const [tree, setTree] = useState<Node[]>([]);
  const [content, setContent] = useState<{ path: string; text: string } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    let timer: number | undefined;
    setJob(null); setLog(""); setTree([]); setContent(null);
    const tick = async () => {
      try {
        const j = await getJob(id); if (!alive) return; setJob(j);
        if (j.status === "running" || j.status === "queued") {
          setLog(await getLog(id));
          if (!alive) return;
          try { setTree(await getFiles(id)); } catch { /* output dir not ready yet */ }
        }
        if (j.status === "done") setTree(await getFiles(id));
        if (j.status === "error") setLog(await getLog(id));
        const active = j.status === "queued" || j.status === "running";
        if (active) timer = window.setTimeout(tick, 2000);
      } catch { /* job deleted or transient error; stop polling */ }
    };
    tick();
    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, [id]);

  // 1s elapsed ticker, only while the job is active
  const active = job?.status === "queued" || job?.status === "running";
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);

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

  const started = Date.parse(job.created_at);
  const fileCount = countFiles(tree);

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
        <div className="run-panel">
          <div className="stage">
            <span className="stage-label">
              <CircleNotch size={17} weight="bold" className="spin" />
              {fileCount > 0 ? "Writing the skill" : job.status === "queued" ? "Queued" : "Reading the document"}
            </span>
            <span className="stage-meta">
              {fmtDuration(now - started)}{fileCount > 0 ? ` · ${fileCount} file${fileCount === 1 ? "" : "s"}` : ""}
            </span>
          </div>
          <div className="progress" />
          {job.book_type === "technical" && (
            <div className="done-note">Technical mode extracts page-by-page — large PDFs can take several minutes.</div>
          )}
          {tree.length > 0 && (
            <div className="panel tree-panel"><FileTree nodes={tree} onPick={() => {}} selected={null} /></div>
          )}
          <details>
            <summary className="terminal-head" style={{ cursor: "pointer" }}>
              <Terminal size={13} weight="bold" /> Run log
            </summary>
            <pre className="terminal" style={{ marginTop: 9 }}>{log || "Starting the converter…"}</pre>
          </details>
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
        <>
          {job.finished_at && (
            <div className="done-note" style={{ marginTop: -8, marginBottom: 16 }}>
              Finished in {fmtDuration(Date.parse(job.finished_at) - started)} · {fileCount} file{fileCount === 1 ? "" : "s"}
            </div>
          )}
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
        </>
      )}
    </div>
  );
}
