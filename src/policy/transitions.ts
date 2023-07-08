import type { CallState } from "../types/call";
import type { DocketState } from "../cargo/docket";
import type { WindowState } from "../berth/window";

const CALL_EDGES: Record<CallState, readonly CallState[]> = {
  announced: ["inbound", "cancelled"],
  inbound: ["alongside", "cancelled"],
  alongside: ["working", "departed", "cancelled"],
  working: ["departed"],
  departed: [],
  cancelled: [],
};

const CARGO_EDGES: Record<DocketState, readonly DocketState[]> = {
  planned: ["gated_in", "held"],
  gated_in: ["stacked", "held", "loaded"],
  stacked: ["loaded", "held"],
  held: ["gated_in", "stacked", "planned"],
  loaded: ["departed"],
  departed: [],
};

const BERTH_EDGES: Record<WindowState, readonly WindowState[]> = {
  offered: ["held", "active", "released"],
  held: ["active", "released"],
  active: ["released"],
  released: [],
};

export function canCall(from: CallState, to: CallState): boolean {
  return CALL_EDGES[from].includes(to);
}

export function canCargo(from: DocketState, to: DocketState): boolean {
