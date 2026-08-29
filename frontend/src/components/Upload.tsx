import { useState } from "react";
import { createJob } from "../api";

export function Upload({ onCreated }: { onCreated: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [bookType, setBookType] = useState("text");
  const [skillName, setSkillName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true); setErr("");
    try { await createJob(file, bookType, skillName); setFile(null); setSkillName(""); onCreated(); }
    catch (e: any) { setErr(String(e.message || e)); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
      <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)}
             accept=".pdf,.epub,.docx,.txt,.md,.html,.htm,.rtf,.mobi,.azw,.azw3" />
      <label>Book type:&nbsp;
        <select value={bookType} onChange={e => setBookType(e.target.value)}>
          <option value="technical">Technical (code/tables/formulas)</option>
          <option value="text">Text-heavy / not sure</option>
        </select>
      </label>
      <input placeholder="skill name (optional)" value={skillName}
             onChange={e => setSkillName(e.target.value)} />
      <button disabled={!file || busy}>{busy ? "Uploading…" : "Convert"}</button>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
    </form>
  );
}
