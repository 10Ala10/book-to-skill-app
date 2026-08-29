import type { Node } from "../api";
export function FileTree({ nodes, onPick }: { nodes: Node[]; onPick: (path: string) => void }) {
  return (
    <ul style={{ listStyle: "none", paddingLeft: 12 }}>
      {nodes.map(n => (
        <li key={n.path}>
          {n.type === "dir"
            ? <><strong>{n.name}/</strong><FileTree nodes={n.children ?? []} onPick={onPick} /></>
            : <button onClick={() => onPick(n.path)}>{n.name}</button>}
        </li>
      ))}
    </ul>
  );
}
