import type { BerthWindow } from "../berth/window";

export function BerthPanel({ windows }: { windows: BerthWindow[] }) {
  if (windows.length === 0) {
    return (
      <section className="ledger-panel">
        <h2>Berth windows</h2>
        <p className="stamp">No windows on the quay board.</p>
      </section>
    );
  }
