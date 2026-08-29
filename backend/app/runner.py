import subprocess
from pathlib import Path
from app import config


def build_prompt(source_path: str, skill_name: str | None, book_type: str) -> str:
    name = f' named "{skill_name}"' if skill_name else ""
    return (
        f"Use the book-to-skill skill to convert the document at {source_path} "
        f"into an agent skill{name}.\n"
        f"Book type: {book_type}. Do NOT ask me any questions — use this book type.\n"
        "Write the generated skill into the current directory. Run the full conversion."
    )


def build_argv(claude_bin: str, prompt: str) -> list[str]:
    # Note: --permission-mode bypassPermissions is the current non-interactive flag
    # for bypassing permission prompts. Verify this matches the installed `claude` version
    # during manual E2E run (Task 10). If it differs, adjust here.
    # ponytail: bypass is safe here only because input is our own document on our own box.
    return [claude_bin, "-p", prompt, "--permission-mode", "bypassPermissions"]


def run(source_path, skill_name, book_type, out_dir: Path, log_path: Path,
        claude_bin: str | None = None) -> int:
    claude_bin = claude_bin or config.get_settings().claude_bin
    prompt = build_prompt(source_path, skill_name, book_type)
    argv = build_argv(claude_bin, prompt)
    with open(log_path, "w") as log:
        proc = subprocess.run(argv, cwd=out_dir, stdout=log,
                              stderr=subprocess.STDOUT)
    return proc.returncode
