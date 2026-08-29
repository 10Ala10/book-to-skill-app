import pytest
from app import config, db

@pytest.fixture(autouse=True)
def _tmp(tmp_path, monkeypatch):
    monkeypatch.setenv("BOOK2SKILL_DATA_DIR", str(tmp_path))
    config.ensure_dirs()
    db.init_db()

def test_create_and_get():
    job = db.create_job("j1", "book.pdf", "/u/j1/book.pdf", "my-skill", "text")
    assert job["status"] == "queued"
    assert job["created_at"] and job["finished_at"] is None
    assert db.get_job("j1")["filename"] == "book.pdf"

def test_next_queued_is_oldest():
    db.create_job("a", "a.pdf", "/a", None, "text")
    db.create_job("b", "b.pdf", "/b", None, "text")
    assert db.next_queued()["id"] == "a"

def test_update_status_terminal_sets_finished():
    db.create_job("j", "j.pdf", "/j", None, "text")
    db.update_status("j", "running")
    assert db.get_job("j")["finished_at"] is None
    db.update_status("j", "done", output_dir="/out/j", finished=True)
    row = db.get_job("j")
    assert row["status"] == "done" and row["output_dir"] == "/out/j"
    assert row["finished_at"] is not None

def test_requeue_running():
    db.create_job("j", "j.pdf", "/j", None, "text")
    db.update_status("j", "running")
    db.requeue_running()
    assert db.get_job("j")["status"] == "queued"

def test_delete():
    db.create_job("j", "j.pdf", "/j", None, "text")
    db.delete_job("j")
    assert db.get_job("j") is None
