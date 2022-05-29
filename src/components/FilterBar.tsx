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
    <div className="filter-bar">
      <input
        type="search"
        placeholder="Search reference, vessel, berth"
        value={query}
        onChange={(event) => onQuery(event.target.value)}
      />
      <select
        aria-label="Call state"
        value={state}
        onChange={(event) => onState(event.target.value as CallState | "all")}
      >
        <option value="all">all states</option>
        {CALL_STATES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <label>
