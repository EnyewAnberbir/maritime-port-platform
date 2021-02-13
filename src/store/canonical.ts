import { activateWindow, holdWindow, offerWindow, WindowBook, type BerthWindow } from "../berth/window";
import { declareVgm, DocketBook, fileDocket, type CargoDocket } from "../cargo/docket";
import { CustomsJournal, openHold, releaseHold, type CustomsHold } from "../customs/hold";
import { GateLog, recordMove, type GateMove } from "../gate/move";
import { canCall } from "../policy/transitions";
import type { CallRow, CallState, VesselCall } from "../types/call";
import { announceCall, assignCallBerth, CallBook } from "../vessel/call";
import { DEFAULT_BLOCKS, YardMap, type RtgBlock, type YardSlot } from "../yard/stack";

export type StoreSnapshot = {
  generation: number;
  nextCallId: number;
  nextWindowId: number;
  nextDocketId: number;
  nextHoldId: number;
  nextMoveId: number;
  calls: VesselCall[];
  windows: BerthWindow[];
  dockets: CargoDocket[];
  holds: CustomsHold[];
  moves: GateMove[];
  slots: YardSlot[];
  blocks: RtgBlock[];
};

export class CanonicalStore {
  generation = 0;
  readonly calls = new CallBook();
  readonly windows = new WindowBook();
  readonly dockets = new DocketBook();
  readonly customs = new CustomsJournal();
  readonly gate = new GateLog();
  readonly yard = new YardMap();

  bump(): number {
    this.generation += 1;
    return this.generation;
  }

  get(id: number): VesselCall | undefined {
    return this.calls.get(id);
  }

  require(id: number): VesselCall {
    return this.calls.require(id);
  }

  all(): VesselCall[] {
    return this.calls.all();
  }

  rows(): CallRow[] {
    return this.calls.rows(this.dockets.boxCounts());
  }

  applyAnnounce(input: Parameters<typeof announceCall>[0]): VesselCall {
    const call = announceCall(input);
    this.calls.put(call);
    return this.require(call.id);
  }

  applyAssignBerth(input: {
    callId: number;
    windowId: number;
    berthId: string;
    startMin: number;
    endMin: number;
    flags: number;
  }): BerthWindow {
    const call = this.require(input.callId);
    const offered = offerWindow({
      id: input.windowId,
      berthId: input.berthId,
      callId: input.callId,
      startMin: input.startMin,
      endMin: input.endMin,
      flags: input.flags,
    });
    const held = holdWindow(offered, input.flags);
    this.windows.put(held);
    this.calls.put(assignCallBerth(call, input.berthId, held.id));
    return this.windows.require(held.id);
  }

  applyAdvance(callId: number, to: CallState): VesselCall {
    const call = this.require(callId);
    if (!canCall(call.state, to)) {
      throw new Error(`cannot advance ${call.reference} ${call.state} -> ${to}`);
    }
    if ((to === "alongside" || to === "working") && !call.berthId) {
      throw new Error(`cannot ${to} ${call.reference} without a berth`);
    }
    if (to === "alongside" && call.windowId) {
      const window = this.windows.require(call.windowId);
      this.windows.put(activateWindow(window));
    }
    return this.calls.patch(callId, { state: to });
  }

  applyDocket(input: Parameters<typeof fileDocket>[0]): CargoDocket {
    this.require(input.callId);
    const docket = fileDocket(input);
    return this.dockets.put(docket);
  }

  applyVgm(box: string, vgmKg: number): CargoDocket {
    const current = this.dockets.require(box);
    return this.dockets.put(declareVgm(current, vgmKg));
  }

  applyGateIn(input: { moveId: number; callId: number; box: string; chassis: string; movedOn: string }): void {
    const docket = this.dockets.require(input.box);
    if (docket.callId !== input.callId) {
      throw new Error(`box ${input.box} is not on call ${input.callId}`);
    }
    if (docket.state !== "planned" && docket.state !== "held") {
      throw new Error(`box ${input.box} cannot gate in from ${docket.state}`);
    }
    this.gate.append(
      recordMove({
        id: input.moveId,
        direction: "in",
        box: input.box,
        chassis: input.chassis,
        callId: input.callId,
        movedOn: input.movedOn,
      }),
    );
    this.dockets.patch(input.box, { state: "gated_in" });
  }

  applyGateOut(input: { moveId: number; callId: number; box: string; chassis: string; movedOn: string }): void {
    if (this.customs.isHeld(input.box)) {
      throw new Error(`box ${input.box} is under customs hold`);
    }
    this.gate.append(
      recordMove({
        id: input.moveId,
        direction: "out",
        box: input.box,
        chassis: input.chassis,
        callId: input.callId,
        movedOn: input.movedOn,
      }),
    );
    const stacked = this.yard.findBox(input.box);
    if (stacked) {
      this.yard.lift(input.box);
    }
    this.dockets.patch(input.box, { state: "departed" });
  }

  applyStack(box: string, block: string, bay: number, row: number, tier: number): void {
    const docket = this.dockets.require(box);
    if (docket.state !== "gated_in" && docket.state !== "held") {
      throw new Error(`box ${box} cannot stack from ${docket.state}`);
    }
    this.yard.place(box, block, bay, row, tier);
    this.dockets.patch(box, { state: this.customs.isHeld(box) ? "held" : "stacked" });
  }

  applyLoad(box: string): void {
    if (this.customs.isHeld(box)) {
      throw new Error(`box ${box} is under customs hold`);
    }
    const docket = this.dockets.require(box);
    if (docket.state !== "stacked" && docket.state !== "gated_in") {
      throw new Error(`box ${box} cannot load from ${docket.state}`);
    }
    if (this.yard.findBox(box)) {
      this.yard.lift(box);
    }
    this.dockets.patch(box, { state: "loaded" });
  }

  applyHold(input: { holdId: number; callId: number; box: string; reason: string; openedOn: string }): CustomsHold {
    this.dockets.require(input.box);
    const hold = openHold({
      id: input.holdId,
      callId: input.callId,
      box: input.box,
      reason: input.reason,
      openedOn: input.openedOn,
    });
    this.customs.put(hold);
    this.dockets.patch(input.box, { state: "held" });
    return this.customs.require(hold.id);
  }

  applyRelease(holdId: number, releasedOn: string): CustomsHold {
    const hold = releaseHold(this.customs.require(holdId), releasedOn);
    this.customs.put(hold);
    const docket = this.dockets.get(hold.box);
    if (docket && docket.state === "held") {
      const next = this.yard.findBox(hold.box) ? "stacked" : this.gate.isInside(hold.box) ? "gated_in" : "planned";
      this.dockets.patch(hold.box, { state: next });
    }
    return hold;
  }

  snapshot(): StoreSnapshot {
    return {
      generation: this.generation,
      nextCallId: this.calls.peekNextId(),
      nextWindowId: this.windows.peekNextId(),
      nextDocketId: this.dockets.peekNextId(),
      nextHoldId: this.customs.peekNextId(),
      nextMoveId: this.gate.peekNextId(),
      calls: this.calls.all(),
      windows: this.windows.all(),
      dockets: this.dockets.all(),
      holds: this.customs.all(),
      moves: this.gate.all(),
      slots: this.yard.all(),
      blocks: DEFAULT_BLOCKS.map((block) => ({ ...block })),
    };
  }

  hydrate(snapshot: StoreSnapshot): void {
    this.generation = snapshot.generation;
    this.calls.hydrate(snapshot.calls, snapshot.nextCallId);
    this.windows.hydrate(snapshot.windows, snapshot.nextWindowId);
    this.dockets.hydrate(snapshot.dockets, snapshot.nextDocketId);
    this.customs.hydrate(snapshot.holds, snapshot.nextHoldId);
    this.gate.hydrate(snapshot.moves, snapshot.nextMoveId);
    this.yard.hydrate(snapshot.slots, snapshot.blocks);
  }
}
