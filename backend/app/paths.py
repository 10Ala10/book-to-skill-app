from pathlib import Path


def safe_join(base: Path, rel: str) -> Path:
    base = base.resolve()
    target = (base / rel).resolve()
    if base != target and base not in target.parents:
        raise ValueError(f"path escapes base: {rel}")
    return target


def build_tree(root: Path) -> list[dict]:
    root = root.resolve()

    def node(p: Path) -> dict:
        rel = p.relative_to(root).as_posix()
        if p.is_dir():
            kids = sorted(p.iterdir(), key=lambda c: (c.is_file(), c.name.lower()))
            return {"name": p.name, "path": rel, "type": "dir",
                    "children": [node(c) for c in kids]}
        return {"name": p.name, "path": rel, "type": "file"}

    kids = sorted(root.iterdir(), key=lambda c: (c.is_file(), c.name.lower()))
    return [node(c) for c in kids]
