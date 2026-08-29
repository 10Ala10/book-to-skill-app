from pathlib import Path
from app import config, db

def _seed_output(jid):
    s = config.get_settings()
    out = s.outputs_dir / jid / "my-skill"; out.mkdir(parents=True)
    (out / "SKILL.md").write_text("# hi")
    db.update_status(jid, "done", output_dir=str(s.outputs_dir / jid), finished=True)

def test_files_tree_and_raw(client):
    jid = client.post("/api/jobs", data={"book_type": "text"},
                      files={"file": ("b.pdf", b"x", "application/pdf")}).json()["id"]
    _seed_output(jid)
    tree = client.get(f"/api/jobs/{jid}/files").json()
    assert tree[0]["name"] == "my-skill"
    raw = client.get(f"/api/jobs/{jid}/files/my-skill/SKILL.md")
    assert raw.text == "# hi"

def test_files_traversal_400(client):
    jid = client.post("/api/jobs", data={"book_type": "text"},
                      files={"file": ("b.pdf", b"x", "application/pdf")}).json()["id"]
    _seed_output(jid)
    assert client.get(f"/api/jobs/{jid}/files/../../etc/passwd").status_code in (400, 404)

def test_download_zip(client):
    jid = client.post("/api/jobs", data={"book_type": "text"},
                      files={"file": ("b.pdf", b"x", "application/pdf")}).json()["id"]
    _seed_output(jid)
    r = client.get(f"/api/jobs/{jid}/download")
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/zip"
