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

/** Port of Zig `domain/berth_math.foldBerthMetrics`. */
export function foldBerthMetrics(seed: number, quay: number, teu: number, moves: number): number {
  let hash = (seed ^ teuDensity(quay, teu)) >>> 0;
  hash ^= yardOccupancy(quay, Math.floor(teu / 2));
  hash ^= chassisDemand(moves, 3, 2);
  hash = Math.imul(hash, 0x9e3779b9) >>> 0;
  return (hash ^ (draftClearanceOk(120, 110) ? 1 : 0)) >>> 0;
}

export function offerWindow(input: {
  id: number;
  berthId: string;
  callId: number;
  startMin: number;
  endMin: number;
  flags?: number;
}): BerthWindow {
  assertWindowSpan(input.startMin, input.endMin);
  if (!acceptTransition(0, 1, input.flags ?? 0)) {
    throw new Error(`berth ${input.berthId} rejected offer transition`);
  }
  return {
    id: input.id,
    berthId: input.berthId,
    callId: input.callId,
    startMin: input.startMin,
    endMin: input.endMin,
    generation: 1,
    state: "offered",
  };
}

export function holdWindow(window: BerthWindow, flags = 0): BerthWindow {
  if (window.state !== "offered") {
    throw new Error(`window ${window.id} is ${window.state}, not offered`);
  }
  const nextGen = window.generation + 1;
  if (!acceptTransition(window.generation, nextGen, flags)) {
    throw new Error(`window ${window.id} rejected hold transition`);
  }
  return { ...window, state: "held", generation: nextGen };
}

export function activateWindow(window: BerthWindow, flags = 0): BerthWindow {
  if (window.state !== "held" && window.state !== "offered") {
    throw new Error(`window ${window.id} cannot activate from ${window.state}`);
  }
  const nextGen = window.generation + 1;
  if (!acceptTransition(window.generation, nextGen, flags)) {
    throw new Error(`window ${window.id} rejected activate transition`);
  }
  return { ...window, state: "active", generation: nextGen };
}

export function releaseWindow(window: BerthWindow): BerthWindow {
  if (window.state === "released") {
    return window;
  }
  return { ...window, state: "released" };
}

export function extendWindow(window: BerthWindow, endMin: number, flags = 0): BerthWindow {
  if (window.state === "released") {
    throw new Error(`window ${window.id} is released`);
  }
  assertWindowSpan(window.startMin, endMin);
  const nextGen = window.generation + 1;
  if (!acceptTransition(window.generation, nextGen, flags)) {
    throw new Error(`window ${window.id} rejected extend transition`);
  }
  return { ...window, endMin, generation: nextGen };
}

export class WindowBook {
  private readonly windows = new Map<number, BerthWindow>();
  private nextId = 1;

  peekNextId(): number {
    return this.nextId;
  }

  put(window: BerthWindow): BerthWindow {
    this.rejectOverlap(window);
    this.windows.set(window.id, { ...window });
    this.nextId = Math.max(this.nextId, window.id + 1);
    return this.require(window.id);
  }

  rejectOverlap(candidate: BerthWindow): void {
    for (const existing of this.windows.values()) {
      if (existing.id === candidate.id || existing.state === "released") {
        continue;
      }
      if (windowsOverlap(existing, candidate)) {
        throw new Error(
          `berth ${candidate.berthId} overlaps window ${existing.id} (${existing.startMin}-${existing.endMin})`,
        );
      }
    }
  }

  get(id: number): BerthWindow | undefined {
    const window = this.windows.get(id);
    return window ? { ...window } : undefined;
  }

  require(id: number): BerthWindow {
    const window = this.get(id);
    if (!window) {
      throw new Error(`berth window ${id} is not on the book`);
    }
    return window;
  }

  forCall(callId: number): BerthWindow | undefined {
    return this.all().find((window) => window.callId === callId && window.state !== "released");
  }

  all(): BerthWindow[] {
    return [...this.windows.values()].map((window) => ({ ...window })).sort((a, b) => a.id - b.id);
  }

  live(): BerthWindow[] {
    return this.all().filter((window) => window.state !== "released");
  }

  hydrate(windows: BerthWindow[], nextId: number): void {
    this.windows.clear();
    for (const window of windows) {
      this.windows.set(window.id, { ...window });
    }
    this.nextId = nextId;
  }
}
