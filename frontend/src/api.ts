export type Job = {
  id: string; filename: string; skill_name: string | null; book_type: string;
  status: "queued" | "running" | "done" | "error";
  output_dir: string | null; error: string | null;
  created_at: string; finished_at: string | null;
};
export type Node = { name: string; path: string; type: "file" | "dir"; children?: Node[] };

export async function createJob(file: File, bookType: string, skillName: string) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("book_type", bookType);
  if (skillName.trim()) fd.append("skill_name", skillName.trim());
  const r = await fetch("/api/jobs", { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ id: string }>;
}
export const listJobs = () => fetch("/api/jobs").then(r => r.json() as Promise<Job[]>);
export const getJob = (id: string) => fetch(`/api/jobs/${id}`).then(r => r.json() as Promise<Job>);
export const getLog = (id: string) => fetch(`/api/jobs/${id}/log`).then(r => r.text());
export const getFiles = (id: string) => fetch(`/api/jobs/${id}/files`).then(r => r.json() as Promise<Node[]>);
export const fileUrl = (id: string, path: string) => `/api/jobs/${id}/files/${path}`;
export const downloadUrl = (id: string) => `/api/jobs/${id}/download`;
export const deleteJob = (id: string) => fetch(`/api/jobs/${id}`, { method: "DELETE" });
