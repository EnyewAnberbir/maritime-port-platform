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
