import { Folder, FileText, FileMd } from "@phosphor-icons/react";
import type { Node } from "../api";

export function FileTree({ nodes, onPick, selected }: { nodes: Node[]; onPick: (path: string) => void; selected: string | null }) {
  return (
    <ul className="tree">
      {nodes.map((n) =>
        n.type === "dir" ? (
          <li key={n.path}>
            <div className="tree-row dir">
              <Folder className="tree-icon" size={16} weight="fill" />
              <span className="tr-name">{n.name}</span>
            </div>
            <FileTree nodes={n.children ?? []} onPick={onPick} selected={selected} />
          </li>
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
