import { CALL_STATES, type CallState } from "../types/call";

export function FilterBar({
  query,
  state,
  flaggedOnly,
  onQuery,
  onState,
  onFlaggedOnly,
}: {
  query: string;
  state: CallState | "all";
  flaggedOnly: boolean;
  onQuery: (query: string) => void;
  onState: (state: CallState | "all") => void;
  onFlaggedOnly: (flaggedOnly: boolean) => void;
}) {
  return (
