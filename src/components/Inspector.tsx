import type { CallRow } from "../types/call";

export function Inspector({ row }: { row: CallRow | null }) {
  if (!row) {
    return (
      <aside className="inspector">
        <h2>Call dossier</h2>
        <p className="stamp">Select a vessel call to read berth, ETA, and box count.</p>
      </aside>
