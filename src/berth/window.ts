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
 * Port of Zig generation accept: flag 1 allows a backward generation,
 * flag 2 rejects a stay, flag 4 rejects a jump larger than 64.
 */
export function acceptTransition(prev: number, next: number, flags: number): boolean {
  const prevU = prev >>> 0;
  const nextU = next >>> 0;
  if (nextU < prevU && (flags & BERTH_FLAG_ALLOW_BACK) === 0) {
    return false;
  }
  if ((flags & BERTH_FLAG_REJECT_STAY) !== 0 && nextU === prevU) {
    return false;
  }
  if ((flags & BERTH_FLAG_CAP_JUMP) !== 0 && nextU > ((prevU + 64) >>> 0)) {
    return false;
  }
  return true;
}

export function windowsOverlap(a: Pick<BerthWindow, "berthId" | "startMin" | "endMin">, b: Pick<BerthWindow, "berthId" | "startMin" | "endMin">): boolean {
  if (a.berthId !== b.berthId) {
    return false;
  }
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

export function assertWindowSpan(startMin: number, endMin: number): void {
  if (endMin <= startMin) {
    throw new Error("berth window end must be after start");
  }
  if (endMin - startMin > 7 * 24 * 60) {
    throw new Error("berth window longer than seven days");
  }
}

export function teuDensity(quayM: number, vesselTeu: number): number {
  if (quayM === 0) {
    return 0;
  }
  return Math.floor((vesselTeu * 1000) / quayM);
}

export function yardOccupancy(quayM: number, blockTeu: number): number {
  if (quayM === 0) {
    return 0;
  }
  return Math.floor((blockTeu * 100) / quayM);
}

export function draftClearanceOk(channelDm: number, vesselDm: number): boolean {
  return channelDm >= vesselDm;
}

export function chassisDemand(moves: number, rateNum: number, rateDen: number): number {
  if (rateDen === 0) {
    return moves;
  }
  return Math.floor((moves * rateNum + rateDen - 1) / rateDen);
}

