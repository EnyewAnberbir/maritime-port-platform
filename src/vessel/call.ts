import { toCallRow, type CallState, type Risk, type VesselCall } from "../types/call";

const IMO_BODY = /^[0-9]{7}$/;

/** ISO 9073 / IMO ship identification: seven digits, last is check. */
export function imoChecksumOk(imo: string): boolean {
  if (!IMO_BODY.test(imo)) {
    return false;
  }
  let acc = 0;
  for (let i = 0; i < 6; i += 1) {
    acc += Number(imo[i]) * (7 - i);
  }
  return acc % 10 === Number(imo[6]);
}

export function assertImo(imo: string): void {
  if (!imoChecksumOk(imo)) {
    throw new Error(`IMO ${imo} fails identification checksum`);
  }
}

export function announceCall(input: {
  id: number;
  reference: string;
  imo: string;
  name: string;
  eta: string;
  draftDm: number;
  risk?: Risk;
  flagged?: boolean;
}): VesselCall {
  assertImo(input.imo);
  if (input.draftDm <= 0 || input.draftDm > 280) {
    throw new Error(`draft ${input.draftDm} dm is outside channel envelope`);
  }
  if (!input.name.trim()) {
    throw new Error("vessel name is required");
  }
  return {
    id: input.id,
    reference: input.reference,
    imo: input.imo,
    name: input.name.trim(),
    eta: input.eta,
    draftDm: input.draftDm,
    state: "announced",
    risk: input.risk ?? "low",
    flagged: input.flagged ?? false,
    berthId: "",
    windowId: null,
    sealed: false,
  };
}

export function assignCallBerth(call: VesselCall, berthId: string, windowId: number): VesselCall {
  if (call.state === "departed" || call.state === "cancelled") {
    throw new Error(`cannot berth ${call.reference} in ${call.state}`);
  }
  return { ...call, berthId, windowId };
}

export class CallBook {
  private readonly calls = new Map<number, VesselCall>();
  private nextId = 1;

  peekNextId(): number {
    return this.nextId;
  }

  put(call: VesselCall): VesselCall {
    this.calls.set(call.id, { ...call });
    this.nextId = Math.max(this.nextId, call.id + 1);
    return this.require(call.id);
  }

  get(id: number): VesselCall | undefined {
    const call = this.calls.get(id);
    return call ? { ...call } : undefined;
  }

  require(id: number): VesselCall {
    const call = this.get(id);
    if (!call) {
      throw new Error(`vessel call ${id} is not on the book`);
    }
    return call;
  }

  byRef(reference: string): VesselCall | undefined {
    return this.all().find((call) => call.reference === reference);
  }

  patch(id: number, patch: Partial<VesselCall>): VesselCall {
    const current = this.require(id);
    const next = { ...current, ...patch, id: current.id };
    this.calls.set(id, next);
    return { ...next };
  }

  all(): VesselCall[] {
    return [...this.calls.values()].map((call) => ({ ...call })).sort((a, b) => a.id - b.id);
  }

  rows(boxCounts: Map<number, number>): ReturnType<typeof toCallRow>[] {
    return this.all().map((call) => toCallRow(call, boxCounts.get(call.id) ?? 0));
  }

  hydrate(calls: VesselCall[], nextId: number): void {
    this.calls.clear();
    for (const call of calls) {
      this.calls.set(call.id, { ...call });
