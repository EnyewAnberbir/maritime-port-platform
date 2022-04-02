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
