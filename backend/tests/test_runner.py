import os, stat
from pathlib import Path
from app import runner

def _make_stub(tmp_path) -> str:
    stub = tmp_path / "stub_claude.sh"
    stub.write_text(
        "#!/usr/bin/env bash\n"
        "echo \"got prompt: $2\"\n"          # -p is $1, prompt is $2
        "mkdir -p my-skill/chapters\n"
        "echo '# SKILL' > my-skill/SKILL.md\n"
        "echo 'one' > my-skill/chapters/one.md\n"
        "exit 0\n"
    )
    stub.chmod(stub.stat().st_mode | stat.S_IEXEC)
    return str(stub)

def test_build_prompt_mentions_book_type():
    p = runner.build_prompt("/x/book.pdf", "my-skill", "technical")
    assert "technical" in p and "book.pdf" in p and "my-skill" in p
    assert "do not ask" in p.lower() or "don't ask" in p.lower()

def test_run_executes_and_writes(tmp_path):
    out = tmp_path / "out"; out.mkdir()
    log = tmp_path / "log.txt"
    code = runner.run("/x/book.pdf", "my-skill", "text", out, log,
                      claude_bin=_make_stub(tmp_path))
    assert code == 0
    assert (out / "my-skill" / "SKILL.md").exists()
    assert "got prompt" in log.read_text()
