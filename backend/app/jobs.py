import io, shutil, zipfile
from pathlib import Path
from app import config, db, paths

def _require(job_id) -> dict:
    job = db.get_job(job_id)
    if not job:
        raise KeyError(job_id)
    return job

def _out_dir(job) -> Path:
    return Path(job["output_dir"]) if job["output_dir"] else \
        config.get_settings().outputs_dir / job["id"]

def tree(job_id) -> list[dict]:
    job = _require(job_id)
    out = _out_dir(job)
    return paths.build_tree(out) if out.is_dir() else []

def read_file(job_id, rel: str) -> bytes:
    job = _require(job_id)
    target = paths.safe_join(_out_dir(job), rel)
    return target.read_bytes()

def zip_bytes(job_id) -> bytes:
    job = _require(job_id)
    out = _out_dir(job)
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for p in out.rglob("*"):
            if p.is_file():
                z.write(p, p.relative_to(out).as_posix())
    return buf.getvalue()

def delete(job_id) -> None:
    job = _require(job_id)
    s = config.get_settings()
    for d in (s.uploads_dir / job_id, s.outputs_dir / job_id):
        shutil.rmtree(d, ignore_errors=True)
    (s.logs_dir / f"{job_id}.log").unlink(missing_ok=True)
    db.delete_job(job_id)
