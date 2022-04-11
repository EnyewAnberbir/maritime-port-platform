import type { CallRow } from "../types/call";

export function CallTable({
  rows,
  selectedIndex,
  onSelectIndex,
  onInspect,
}: {
  rows: CallRow[];
  selectedIndex: number | null;
  onSelectIndex: (index: number) => void;
  onInspect: (row: CallRow) => void;
}) {
  return (
    <table className="call-table">
      <thead>
        <tr>
          <th>Ref</th>
          <th>Vessel</th>
          <th>Berth</th>
          <th>ETA</th>
          <th>Boxes</th>
          <th>State</th>
          <th>Risk</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            key={index}
            data-selected={selectedIndex === index}
            onClick={() => onSelectIndex(index)}
          >
            <td>{row.reference}</td>
            <td className={row.flagged ? "flagged" : undefined}>{row.vessel}</td>
            <td>{row.berth || "—"}</td>
            <td>{row.eta.slice(0, 16).replace("T", " ")}</td>
            <td>{row.boxes}</td>
            <td>{row.state}</td>
            <td>
              <span className={`severity-${row.risk}`} />
            </td>
            <td>
              <button type="button" onClick={() => onInspect(row)}>
                Inspect
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
