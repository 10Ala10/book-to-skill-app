import os
from dataclasses import dataclass
from pathlib import Path

@dataclass(frozen=True)
class Settings:
    data_dir: Path
    claude_bin: str

    @property
    def uploads_dir(self) -> Path: return self.data_dir / "uploads"
    @property
    def outputs_dir(self) -> Path: return self.data_dir / "outputs"
    @property
    def logs_dir(self) -> Path: return self.data_dir / "logs"
    @property
    def db_path(self) -> Path: return self.data_dir / "app.db"

def get_settings() -> Settings:
    default_data = Path(__file__).resolve().parents[1] / "data"
    data_dir = Path(os.environ.get("BOOK2SKILL_DATA_DIR", default_data))
    claude_bin = os.environ.get("BOOK2SKILL_CLAUDE_BIN", "claude")
    return Settings(data_dir=data_dir, claude_bin=claude_bin)

def ensure_dirs() -> None:
    s = get_settings()
    for d in (s.uploads_dir, s.outputs_dir, s.logs_dir):
        d.mkdir(parents=True, exist_ok=True)
