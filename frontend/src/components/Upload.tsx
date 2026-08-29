import { useState } from "react";
import { UploadSimple, FileText, X, WarningCircle } from "@phosphor-icons/react";
import { createJob } from "../api";

export function Upload({ onCreated }: { onCreated: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [bookType, setBookType] = useState("text");
  const [skillName, setSkillName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true); setErr("");
    try { await createJob(file, bookType, skillName); setFile(null); setSkillName(""); onCreated(); }
    catch (e: any) { setErr(String(e.message || e)); }
    finally { setBusy(false); }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
      <div
        className={`dropzone${drag ? " drag" : ""}${file ? " has-file" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          accept=".pdf,.epub,.docx,.txt,.md,.html,.htm,.rtf,.mobi,.azw,.azw3"
        />
        {file ? (
          <div className="file-chip">
            <FileText size={20} weight="regular" style={{ color: "var(--accent)" }} />
            <span className="fc-name">{file.name}</span>
            <button
              type="button"
              className="btn-icon fc-clear"
              aria-label="Remove file"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <>
            <UploadSimple size={22} weight="regular" />
            <span className="dropzone-title">Drop a document, or click to browse</span>
            <span className="dropzone-hint">PDF, EPUB, DOCX, Markdown, HTML, RTF, MOBI</span>
          </>
        )}
      </div>

      <div className="field">
        <label>Content type</label>
        <div className="segmented" role="group" aria-label="Content type">
          <button type="button" aria-pressed={bookType === "technical"} onClick={() => setBookType("technical")}>
            Technical
          </button>
          <button type="button" aria-pressed={bookType === "text"} onClick={() => setBookType("text")}>
            Text&#8202;/&#8202;not sure
          </button>
        </div>
      </div>

      <div className="field">
        <label htmlFor="skill-name">Skill name <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span></label>
        <input
          id="skill-name"
          className="input"
          placeholder="auto-named from the document"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
        />
      </div>

      <button className="btn btn-primary" disabled={!file || busy}>
        <UploadSimple size={16} weight="bold" />
        {busy ? "Uploading…" : "Convert to skill"}
      </button>

      {err && (
        <div className="form-error">
          <WarningCircle size={16} weight="fill" style={{ flex: "none", marginTop: 1 }} />
          <span>{err}</span>
        </div>
      )}
    </form>
  );
}
