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
