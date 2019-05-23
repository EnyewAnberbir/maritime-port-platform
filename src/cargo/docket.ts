import type { IsoSize } from "../types/call";

export type DocketState = "planned" | "gated_in" | "stacked" | "held" | "loaded" | "departed";

export type CargoDocket = {
  id: number;
  callId: number;
