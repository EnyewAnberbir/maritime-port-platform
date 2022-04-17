import type { CargoDocket } from "../cargo/docket";

export function CargoPanel({ dockets }: { dockets: CargoDocket[] }) {
  if (dockets.length === 0) {
    return (
      <section className="ledger-panel">
        <h2>Cargo dockets</h2>
        <p className="stamp">No ISO boxes on file.</p>
      </section>
    );
  }
  return (
    <section className="ledger-panel">
      <h2>Cargo dockets</h2>
      <ul>
        {dockets.map((docket) => (
          <li key={docket.box}>
            {docket.box} · {docket.isoSize}' · VGM {docket.vgmKg} kg · {docket.state}
            {docket.hazmatClass ? ` · IMDG ${docket.hazmatClass}` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}
