import type { CustomsHold } from "../customs/hold";

export function CustomsPanel({ holds }: { holds: CustomsHold[] }) {
  if (holds.length === 0) {
    return (
      <section className="ledger-panel">
        <h2>Customs journal</h2>
        <p className="stamp">No open or released holds.</p>
      </section>
    );
  }
  return (
    <section className="ledger-panel">
      <h2>Customs journal</h2>
      <ul>
        {holds.map((hold) => (
          <li key={hold.id}>
            {hold.box} · {hold.reason} · {hold.releasedOn ? "released" : "held"}
          </li>
        ))}
      </ul>
    </section>
  );
}
