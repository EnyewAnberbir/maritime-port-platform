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
