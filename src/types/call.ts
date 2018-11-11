export const CALL_STATES = [
  "announced",
  "inbound",
  "alongside",
  "working",
  "departed",
  "cancelled",
] as const;

export type CallState = (typeof CALL_STATES)[number];

export type Risk = "low" | "medium" | "high";

export type IsoSize = "20" | "40" | "45";

export type CallRow = {
  id: number;
  reference: string;
  vessel: string;
  berth: string;
  state: CallState;
