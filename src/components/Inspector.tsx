import type { CallRow } from "../types/call";

export function Inspector({ row }: { row: CallRow | null }) {
  if (!row) {
    return (
      <aside className="inspector">
        <h2>Call dossier</h2>
        <p className="stamp">Select a vessel call to read berth, ETA, and box count.</p>
      </aside>
    );
  }
  return (
    <aside className="inspector">
      <h2>Call dossier</h2>
      <p>{row.reference}</p>
      <p>{row.vessel}</p>
      <p>berth {row.berth || "unassigned"}</p>
      <p>state {row.state}</p>
      <p>
        risk <span className={`severity-${row.risk}`} />
      </p>
      <p>eta {row.eta}</p>
      <p>boxes {row.boxes}</p>
      <p>{row.flagged ? "flagged on the board" : "clear"}</p>
    </aside>
  );
}
