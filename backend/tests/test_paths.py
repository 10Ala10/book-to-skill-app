import pytest
from pathlib import Path
from app import paths


def test_safe_join_ok(tmp_path):
    (tmp_path / "a").mkdir()
    p = paths.safe_join(tmp_path, "a/b.txt")
    assert str(p).startswith(str(tmp_path))


@pytest.mark.parametrize("bad", ["../secret", "a/../../secret", "/etc/passwd"])
def test_safe_join_rejects_traversal(tmp_path, bad):
    with pytest.raises(ValueError):
        paths.safe_join(tmp_path, bad)


def test_build_tree(tmp_path):
    (tmp_path / "chapters").mkdir()
    (tmp_path / "chapters" / "one.md").write_text("x")
    (tmp_path / "SKILL.md").write_text("y")
    tree = paths.build_tree(tmp_path)
    names = [n["name"] for n in tree]
    assert names == ["chapters", "SKILL.md"]  # dirs first
    ch = tree[0]
    assert ch["type"] == "dir" and ch["children"][0]["name"] == "one.md"
    assert ch["children"][0]["path"] == "chapters/one.md"
