# book-to-skill app

Internal web wrapper for the `book-to-skill` Claude Code skill.

## Prerequisites (one-time, on the host)
- `claude` CLI installed and logged in (`claude` runs interactively once to auth).
- `book-to-skill` skill installed at `~/.claude/skills/book-to-skill`.
- Its Python deps installed (docling etc.) — see that skill's pyproject.
- Python 3.11+, Node 18+.

## Notes
- Only convert documents you trust — conversion runs the `claude` agent with permissions bypassed on this box.
- Run a single backend process (do not use `uvicorn --workers N`) — the job queue assumes one worker.

## Run (dev)
```bash
# backend
cd backend && pip install -e ".[dev]" && uvicorn app.main:app --reload
# frontend (separate shell)
cd frontend && npm install && npm run dev   # http://localhost:5173
```

## Run (single process)
```bash
cd frontend && npm run build
cd ../backend && uvicorn app.main:app --port 8000   # serves API + UI at :8000
```

## Config (env)
- `BOOK2SKILL_DATA_DIR` — where uploads/outputs/logs/db live (default `backend/data`).
- `BOOK2SKILL_CLAUDE_BIN` — claude binary (default `claude`).

## Tests
```bash
cd backend && python -m pytest -v
```
