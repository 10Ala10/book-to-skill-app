import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("BOOK2SKILL_DATA_DIR", str(tmp_path))
    # Prevent the background worker from touching jobs during API tests:
    monkeypatch.setenv("BOOK2SKILL_DISABLE_WORKER", "1")
    from app import main
    with TestClient(main.app) as c:
        yield c
