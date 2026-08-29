# book-to-skill-app

Turn any book or document into a structured [Claude Code](https://claude.com/claude-code) agent skill, from a browser. Upload a PDF (or EPUB, DOCX, Markdown, HTML, RTF, MOBI), and the app runs the [`book-to-skill`](https://github.com/virgiliojr94/book-to-skill) converter headless and hands you back a ready-to-install skill: `SKILL.md`, chapter files, a glossary, patterns, and a cheatsheet.

A small self-hosted web front-end over a skill that normally runs in the terminal. Uploads and results stay on your machine.

## What it does

1. You upload a document and pick a content type (Technical or Text).
2. A background worker runs the `book-to-skill` skill through the `claude` CLI in an isolated per-job folder.
3. The generated skill folder is stored on disk; the UI shows a live file tree, a markdown viewer, the run log, and a zip download.

Extraction (PDF -> markdown) is deterministic and free. Only the synthesis step uses your Claude usage.

## Requirements

This app is a wrapper. It does not talk to any model API itself; it drives your local Claude Code install, so you need:

- **[Claude Code](https://claude.com/claude-code)** installed and logged in (`claude` on your `PATH`). Uses your existing Claude subscription; the app never handles API keys.
- The **[`book-to-skill`](https://github.com/virgiliojr94/book-to-skill) skill** installed where Claude Code can find it (e.g. `~/.claude/skills/book-to-skill`), plus its Python dependencies (Docling and the per-format parsers) for extraction.
- **Python 3.11+** and **Node 18+**.

> Not affiliated with Anthropic. "Claude" and "Claude Code" are products of Anthropic.

## Quickstart

```bash
git clone https://github.com/10Ala10/book-to-skill-app
cd book-to-skill-app

# 1. Build the UI
cd frontend && npm install && npm run build && cd ..

# 2. Run the server (serves the API and the built UI on one port)
cd backend && pip install -e ".[dev]"
uvicorn app.main:app --port 8000
```

Open <http://localhost:8000> and upload a document.

### Development (hot reload)

```bash
# backend
cd backend && pip install -e ".[dev]" && uvicorn app.main:app --reload   # :8000
# frontend, separate shell
cd frontend && npm install && npm run dev                                # :5173, proxies /api to :8000
```

## Security

- **Only convert documents you trust.** The converter runs the Claude agent with permissions bypassed (`--permission-mode bypassPermissions`) so it can extract and write files without prompting. A malicious document could contain instructions the agent acts on. Run this on your own machine, on your own files.
- The app has **no authentication** by default. It is built to run locally for one person. Do not expose it to the public internet as-is.
- Run a **single backend process** (do not use `uvicorn --workers N`). The job queue assumes one worker.

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `BOOK2SKILL_DATA_DIR` | `backend/data` | Where uploads, generated skills, logs, and the SQLite DB live |
| `BOOK2SKILL_CLAUDE_BIN` | `claude` | Path to the `claude` binary |

## How it works

```
React (Vite) ──HTTP──▶ FastAPI ──▶ SQLite (job metadata)
                          │
                          ├──▶ local disk (uploads / outputs / logs)
                          └──▶ worker thread ──▶ `claude -p` (book-to-skill, headless)
```

- **Backend** (`backend/app`): `config` (env), `db` (SQLite jobs), `paths` (path-traversal guard), `runner` (builds the `claude` command), `worker` (single-worker queue), `jobs` (file tree / zip / delete), `main` (FastAPI + static serve).
- **Frontend** (`frontend/src`): upload, jobs list, and a job detail view with live progress, a collapsible file tree, and a markdown viewer.
- Jobs run one at a time. Interrupted `running` jobs are re-queued on restart.

## Tech stack

FastAPI, Uvicorn, SQLite (stdlib), pytest on the backend. Vite, React, TypeScript, react-markdown, Phosphor icons on the frontend.

## Tests

```bash
cd backend && python -m pytest -v
```

The suite stubs the `claude` binary, so it needs no Claude subscription or network.

## Credits

- Built on the [`book-to-skill`](https://github.com/virgiliojr94/book-to-skill) skill by [virgiliojr94](https://github.com/virgiliojr94) (MIT). This app is a self-hosted UI around it; all of the document-to-skill conversion logic lives there.

## License

[MIT](./LICENSE)
