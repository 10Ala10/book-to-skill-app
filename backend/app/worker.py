import threading, time
from pathlib import Path
from app import config, db, runner

def _output_nonempty(out_dir: Path) -> bool:
    return out_dir.is_dir() and any(out_dir.rglob("SKILL.md"))

def process_one() -> bool:
    job = db.next_queued()
    if not job:
        return False
    s = config.get_settings()
    out_dir = s.outputs_dir / job["id"]
    out_dir.mkdir(parents=True, exist_ok=True)
    log_path = s.logs_dir / f"{job['id']}.log"
    db.update_status(job["id"], "running", output_dir=str(out_dir))
    try:
        code = runner.run(job["pdf_path"], job["skill_name"], job["book_type"],
                          out_dir, log_path)
    except Exception as e:  # noqa: BLE001
        db.update_status(job["id"], "error", error=f"runner crashed: {e}", finished=True)
        return True
    if code == 0 and _output_nonempty(out_dir):
        db.update_status(job["id"], "done", finished=True)
    else:
        tail = ""
        if log_path.exists():
            tail = "".join(log_path.read_text(errors="replace").splitlines(keepends=True)[-20:])
        db.update_status(job["id"], "error",
                         error=f"exit={code}\n{tail}", finished=True)
    return True

def start() -> None:
    def loop():
        while True:
            if not process_one():
                time.sleep(1.0)
    threading.Thread(target=loop, daemon=True).start()
