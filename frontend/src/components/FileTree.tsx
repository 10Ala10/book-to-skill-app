import { useState } from "react";
import { Folder, FolderOpen, FileText, FileMd, CaretRight } from "@phosphor-icons/react";
import type { Node } from "../api";

function DirNode({ node, onPick, selected }: { node: Node; onPick: (path: string) => void; selected: string | null }) {
  const [open, setOpen] = useState(true);
  const children = node.children ?? [];
  return (
    <li>
      <button className="tree-row dir" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <CaretRight className={`tree-caret${open ? " open" : ""}`} size={12} weight="bold" />
        {open ? <FolderOpen className="tree-icon" size={16} weight="fill" /> : <Folder className="tree-icon" size={16} weight="fill" />}
        <span className="tr-name">{node.name}</span>
        <span className="tr-count">{children.length}</span>
      </button>
      {open && <FileTree nodes={children} onPick={onPick} selected={selected} />}
    </li>
  );
}

export function FileTree({ nodes, onPick, selected }: { nodes: Node[]; onPick: (path: string) => void; selected: string | null }) {
  return (
    <ul className="tree">
      {nodes.map((n) =>
        n.type === "dir" ? (
          <DirNode key={n.path} node={n} onPick={onPick} selected={selected} />
        ) : (
          <li key={n.path}>
            <button
              className={`tree-row file${selected === n.path ? " active" : ""}`}
              onClick={() => onPick(n.path)}
            >
              {n.name.endsWith(".md") ? (
                <FileMd className="tree-icon" size={16} weight="regular" />
              ) : (
                <FileText className="tree-icon" size={16} weight="regular" />
              )}
              <span className="tr-name">{n.name}</span>
            </button>
          </li>
        )
      )}
    </ul>
  );
}
