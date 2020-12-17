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
