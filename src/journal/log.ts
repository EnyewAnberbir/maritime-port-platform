import type { CallState, IsoSize, Risk } from "../types/call";
import type { DocketState } from "../cargo/docket";

export type JournalEvent =
  | {
      seq: number;
      kind: "announce";
      callId: number;
      reference: string;
      imo: string;
      name: string;
      eta: string;
      draftDm: number;
      risk: Risk;
      flagged: boolean;
    }
  | {
      seq: number;
      kind: "assign-berth";
      callId: number;
      windowId: number;
      berthId: string;
      startMin: number;
      endMin: number;
      flags: number;
    }
  | {
      seq: number;
      kind: "advance-call";
      callId: number;
      from: CallState;
      to: CallState;
    }
  | {
      seq: number;
      kind: "file-docket";
      docketId: number;
      callId: number;
      box: string;
      isoSize: IsoSize;
