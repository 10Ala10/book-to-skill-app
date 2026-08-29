import type { Job } from "../api";

const LABELS: Record<Job["status"], string> = {
  queued: "Queued",
  running: "Running",
  done: "Done",
  error: "Error",
};

export function StatusPill({ status }: { status: Job["status"] }) {
  return (
    <span className={`status status-${status}`}>
      <span className="dot" />
      {LABELS[status]}
    </span>
  );
}
