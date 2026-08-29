import os
from pathlib import Path
from app import config

def test_settings_honor_env(tmp_path, monkeypatch):
    monkeypatch.setenv("BOOK2SKILL_DATA_DIR", str(tmp_path))
    monkeypatch.setenv("BOOK2SKILL_CLAUDE_BIN", "fake-claude")
    s = config.get_settings()
    assert s.data_dir == tmp_path
    assert s.uploads_dir == tmp_path / "uploads"
    assert s.db_path == tmp_path / "app.db"
    assert s.claude_bin == "fake-claude"

def test_ensure_dirs_creates(tmp_path, monkeypatch):
    monkeypatch.setenv("BOOK2SKILL_DATA_DIR", str(tmp_path))
    config.ensure_dirs()
    assert (tmp_path / "uploads").is_dir()
    assert (tmp_path / "outputs").is_dir()
    assert (tmp_path / "logs").is_dir()
