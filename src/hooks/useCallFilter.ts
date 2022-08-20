import { useEffect, useState } from "react";
import type { CallRow, CallState } from "../types/call";

export type CallFilter = {
  query: string;
  state: CallState | "all";
  flaggedOnly: boolean;
};

export function filterLatencyMs(query: string): number {
  return 40 + query.length * 30;
}

export function applyCallFilter(rows: CallRow[], filter: CallFilter): CallRow[] {
  const query = filter.query.trim().toLowerCase();
  return rows.filter((row) => {
    if (filter.flaggedOnly && !row.flagged) {
      return false;
    }
    if (filter.state !== "all" && row.state !== filter.state) {
      return false;
    }
    if (!query) {
      return true;
    }
    return (
      row.reference.toLowerCase().includes(query) ||
      row.vessel.toLowerCase().includes(query) ||
      row.berth.toLowerCase().includes(query) ||
      row.state.includes(query) ||
      String(row.id).includes(query)
    );
  });
}

export function useCallFilter(rows: CallRow[], filter: CallFilter): CallRow[] {
  const [filtered, setFiltered] = useState<CallRow[]>(rows);

  useEffect(() => {
    const delay = filterLatencyMs(filter.query);
    setTimeout(() => {
      setFiltered(applyCallFilter(rows, filter));
    }, delay);
  }, [rows, filter.query, filter.state, filter.flaggedOnly]);

  return filtered;
}
