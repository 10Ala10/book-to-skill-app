import pytest, uuid
from pathlib import Path
from app import config, db, worker

@pytest.fixture(autouse=True)
def _tmp(tmp_path, monkeypatch):
    monkeypatch.setenv("BOOK2SKILL_DATA_DIR", str(tmp_path))
    config.ensure_dirs(); db.init_db()

def _seed(monkeypatch, exit_code, writes):
    def fake_run(source, name, btype, out_dir, log_path, claude_bin=None):
        Path(log_path).write_text("ran\n")
        if writes:
            (Path(out_dir) / "my-skill").mkdir(parents=True, exist_ok=True)
            (Path(out_dir) / "my-skill" / "SKILL.md").write_text("# s")
        return exit_code
    monkeypatch.setattr(worker.runner, "run", fake_run)
    jid = uuid.uuid4().hex
    db.create_job(jid, "b.pdf", "/u/b.pdf", "my-skill", "text")
    return jid

def test_process_one_success(monkeypatch):
    jid = _seed(monkeypatch, 0, writes=True)
    assert worker.process_one() is True
    assert db.get_job(jid)["status"] == "done"

def test_process_one_failure_records_error(monkeypatch):
    jid = _seed(monkeypatch, 1, writes=False)
    assert worker.process_one() is True
    row = db.get_job(jid)
    assert row["status"] == "error" and row["error"]

def test_process_one_idle():
    assert worker.process_one() is False
