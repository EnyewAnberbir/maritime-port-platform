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
  risk: Risk;
  flagged: boolean;
  eta: string;
  boxes: number;
};

export type VesselCall = {
  id: number;
  reference: string;
  imo: string;
  name: string;
  eta: string;
  draftDm: number;
  state: CallState;
  risk: Risk;
  flagged: boolean;
  berthId: string;
  windowId: number | null;
  sealed: boolean;
};
