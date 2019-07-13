import type { IsoSize } from "../types/call";

export type DocketState = "planned" | "gated_in" | "stacked" | "held" | "loaded" | "departed";

export type CargoDocket = {
  id: number;
  callId: number;
  box: string;
  isoSize: IsoSize;
  vgmKg: number;
  tareKg: number;
  laden: boolean;
  hazmatClass: string;
  state: DocketState;
};

const ISO_BOX = /^[A-Z]{3}U[0-9]{7}$/;
const MAX_VGM: Record<IsoSize, number> = {
  "20": 30480,
  "40": 32500,
  "45": 32500,
};

export function isIsoBox(box: string): boolean {
  return ISO_BOX.test(box);
}

export function assertIsoBox(box: string): void {
  if (!isIsoBox(box)) {
    throw new Error(`box ${box} is not an ISO 6346 owner/serial`);
  }
}

export function assertHazmatClass(hazmatClass: string): void {
  if (hazmatClass === "") {
    return;
  }
  if (!/^[1-9](\.[1-6])?$/.test(hazmatClass)) {
    throw new Error(`hazmat class ${hazmatClass} is not an IMDG division`);
  }
}

/** SOLAS VGM: laden boxes need verified mass above tare; empty may equal tare. */
export function vgmAcceptable(docket: Pick<CargoDocket, "vgmKg" | "tareKg" | "laden" | "isoSize">): boolean {
  if (docket.tareKg <= 0 || docket.tareKg > 8000) {
    return false;
  }
  if (docket.vgmKg > MAX_VGM[docket.isoSize]) {
    return false;
  }
  if (!docket.laden) {
    return docket.vgmKg === docket.tareKg;
  }
  return docket.vgmKg >= docket.tareKg + 100;
}

export function assertVgm(docket: Pick<CargoDocket, "vgmKg" | "tareKg" | "laden" | "isoSize" | "box">): void {
  if (!vgmAcceptable(docket)) {
    throw new Error(`box ${docket.box} VGM ${docket.vgmKg} kg fails SOLAS check`);
  }
}

export function fileDocket(input: {
  id: number;
  callId: number;
  box: string;
  isoSize: IsoSize;
  vgmKg: number;
  tareKg: number;
  laden: boolean;
  hazmatClass?: string;
}): CargoDocket {
  assertIsoBox(input.box);
  assertHazmatClass(input.hazmatClass ?? "");
  const docket: CargoDocket = {
    id: input.id,
    callId: input.callId,
    box: input.box,
    isoSize: input.isoSize,
    vgmKg: input.vgmKg,
    tareKg: input.tareKg,
    laden: input.laden,
    hazmatClass: input.hazmatClass ?? "",
    state: "planned",
  };
  assertVgm(docket);
  return docket;
}

export function declareVgm(docket: CargoDocket, vgmKg: number): CargoDocket {
  const next = { ...docket, vgmKg };
  assertVgm(next);
  return next;
}

export class DocketBook {
  private readonly dockets = new Map<string, CargoDocket>();
  private nextId = 1;

  peekNextId(): number {
    return this.nextId;
  }

  put(docket: CargoDocket): CargoDocket {
    this.dockets.set(docket.box, { ...docket });
    this.nextId = Math.max(this.nextId, docket.id + 1);
    return this.require(docket.box);
  }

  get(box: string): CargoDocket | undefined {
    const docket = this.dockets.get(box);
    return docket ? { ...docket } : undefined;
  }

  require(box: string): CargoDocket {
    const docket = this.get(box);
    if (!docket) {
      throw new Error(`docket ${box} is not on the book`);
    }
    return docket;
  }

  patch(box: string, patch: Partial<CargoDocket>): CargoDocket {
    const current = this.require(box);
    const next = { ...current, ...patch, box: current.box, id: current.id };
    this.dockets.set(box, next);
    return { ...next };
  }

  all(): CargoDocket[] {
    return [...this.dockets.values()].map((docket) => ({ ...docket })).sort((a, b) => a.id - b.id);
  }

  forCall(callId: number): CargoDocket[] {
    return this.all().filter((docket) => docket.callId === callId);
  }

  countForCall(callId: number): number {
    return this.forCall(callId).length;
  }

  boxCounts(): Map<number, number> {
    const counts = new Map<number, number>();
    for (const docket of this.dockets.values()) {
      counts.set(docket.callId, (counts.get(docket.callId) ?? 0) + 1);
    }
    return counts;
