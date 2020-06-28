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
