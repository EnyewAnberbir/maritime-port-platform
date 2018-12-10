export const BERTH_FLAG_ALLOW_BACK = 1;
export const BERTH_FLAG_REJECT_STAY = 2;
export const BERTH_FLAG_CAP_JUMP = 4;

export const KNOWN_BERTHS = ["B-12", "Q-3"] as const;

export type BerthId = (typeof KNOWN_BERTHS)[number] | string;

export type WindowState = "offered" | "held" | "active" | "released";

export type BerthWindow = {
  id: number;
  berthId: string;
  callId: number;
  startMin: number;
  endMin: number;
  generation: number;
  state: WindowState;
};

/**
