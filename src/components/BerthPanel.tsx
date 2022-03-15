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
  return (
    <section className="ledger-panel">
      <h2>Berth windows</h2>
      <ul>
        {windows.map((window) => (
          <li key={window.id}>
            {window.berthId} · call {window.callId} · {window.startMin}–{window.endMin} · {window.state} ·
            gen {window.generation}
          </li>
        ))}
      </ul>
    </section>
  );
}
