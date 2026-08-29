import io, os, uuid, mimetypes
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import PlainTextResponse, JSONResponse, Response
from app import config, db, jobs, worker
from app.schemas import JobOut

app = FastAPI(title="book-to-skill")

@app.on_event("startup")
def _startup():
    db.init_db()
    if os.environ.get("BOOK2SKILL_DISABLE_WORKER") != "1":
        worker.start()

@app.post("/api/jobs", status_code=201)
def create_job(file: UploadFile = File(...), book_type: str = Form(...),
               skill_name: str | None = Form(None)):
    if book_type not in ("technical", "text"):
        raise HTTPException(422, "book_type must be 'technical' or 'text'")
    s = config.get_settings()
    jid = uuid.uuid4().hex
    dest_dir = s.uploads_dir / jid
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / (file.filename or "upload.bin")
    dest.write_bytes(file.file.read())
    name = (skill_name or "").strip() or None
    db.create_job(jid, dest.name, str(dest), name, book_type)
    return {"id": jid, "status": "queued"}

def _job_or_404(job_id) -> dict:
    job = db.get_job(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    return job

@app.get("/api/jobs", response_model=list[JobOut])
def list_jobs():
    return db.list_jobs()

@app.get("/api/jobs/{job_id}", response_model=JobOut)
def get_job(job_id: str):
    return _job_or_404(job_id)

@app.get("/api/jobs/{job_id}/log", response_class=PlainTextResponse)
def get_log(job_id: str):
    _job_or_404(job_id)
    log = config.get_settings().logs_dir / f"{job_id}.log"
    return log.read_text(errors="replace") if log.exists() else ""

@app.get("/api/jobs/{job_id}/files")
def get_files(job_id: str):
    _job_or_404(job_id)
    return JSONResponse(jobs.tree(job_id))

@app.get("/api/jobs/{job_id}/files/{rel:path}")
def get_file(job_id: str, rel: str):
    _job_or_404(job_id)
    try:
        data = jobs.read_file(job_id, rel)
    except ValueError:
        raise HTTPException(400, "invalid path")
    except (FileNotFoundError, IsADirectoryError):
        raise HTTPException(404, "file not found")
    media = mimetypes.guess_type(rel)[0] or "application/octet-stream"
    return Response(data, media_type=media)

@app.get("/api/jobs/{job_id}/download")
def download(job_id: str):
    _job_or_404(job_id)
    data = jobs.zip_bytes(job_id)
    return Response(data, media_type="application/zip", headers={
        "Content-Disposition": f'attachment; filename="{job_id}.zip"'})

@app.delete("/api/jobs/{job_id}", status_code=204)
def delete_job(job_id: str):
    _job_or_404(job_id)
    jobs.delete(job_id)
    return Response(status_code=204)
