import pytest, io, zipfile
from pathlib import Path
from app import config, db, jobs

@pytest.fixture(autouse=True)
def _tmp(tmp_path, monkeypatch):
    monkeypatch.setenv("BOOK2SKILL_DATA_DIR", str(tmp_path))
    config.ensure_dirs(); db.init_db()

def _job_with_output():
    s = config.get_settings()
    db.create_job("j", "b.pdf", str(s.uploads_dir / "j" / "b.pdf"), "my-skill", "text")
    out = s.outputs_dir / "j" / "my-skill"; out.mkdir(parents=True)
    (out / "SKILL.md").write_text("# hi")
    db.update_status("j", "done", output_dir=str(s.outputs_dir / "j"), finished=True)

def test_tree_and_read():
    _job_with_output()
    tree = jobs.tree("j")
    assert tree[0]["name"] == "my-skill"
    assert jobs.read_file("j", "my-skill/SKILL.md") == b"# hi"

def test_read_file_traversal_blocked():
    _job_with_output()
    with pytest.raises(ValueError):
        jobs.read_file("j", "../../../etc/passwd")

def test_zip_contains_file():
    _job_with_output()
    z = zipfile.ZipFile(io.BytesIO(jobs.zip_bytes("j")))
    assert any(n.endswith("SKILL.md") for n in z.namelist())

def test_delete_removes_files_and_row():
    _job_with_output()
    jobs.delete("j")
    assert db.get_job("j") is None
    assert not (config.get_settings().outputs_dir / "j").exists()
