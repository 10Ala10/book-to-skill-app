import sqlite3
from datetime import datetime, timezone
from app import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  pdf_path TEXT NOT NULL,
  skill_name TEXT,
  book_type TEXT NOT NULL,
  status TEXT NOT NULL,
  output_dir TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  finished_at TEXT
);
"""

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def _conn() -> sqlite3.Connection:
    c = sqlite3.connect(str(config.get_settings().db_path))
    c.row_factory = sqlite3.Row
    return c

def init_db() -> None:
    config.ensure_dirs()
    with _conn() as c:
        c.execute(SCHEMA)

def create_job(id, filename, pdf_path, skill_name, book_type) -> dict:
    with _conn() as c:
        c.execute(
            "INSERT INTO jobs (id, filename, pdf_path, skill_name, book_type, status, created_at)"
            " VALUES (?,?,?,?,?, 'queued', ?)",
            (id, filename, pdf_path, skill_name, book_type, _now()),
        )
    return get_job(id)

def get_job(id) -> dict | None:
    with _conn() as c:
        row = c.execute("SELECT * FROM jobs WHERE id=?", (id,)).fetchone()
    return dict(row) if row else None

def list_jobs() -> list[dict]:
    with _conn() as c:
        rows = c.execute("SELECT * FROM jobs ORDER BY created_at DESC").fetchall()
    return [dict(r) for r in rows]

def next_queued() -> dict | None:
    with _conn() as c:
        row = c.execute(
            "SELECT * FROM jobs WHERE status='queued' ORDER BY created_at ASC LIMIT 1"
        ).fetchone()
    return dict(row) if row else None

def update_status(id, status, *, output_dir=None, error=None, finished=False) -> None:
    fin = _now() if finished else None
    with _conn() as c:
        c.execute(
            "UPDATE jobs SET status=?,"
            " output_dir=COALESCE(?, output_dir),"
            " error=COALESCE(?, error),"
            " finished_at=COALESCE(?, finished_at) WHERE id=?",
            (status, output_dir, error, fin, id),
        )

def delete_job(id) -> None:
    with _conn() as c:
        c.execute("DELETE FROM jobs WHERE id=?", (id,))
