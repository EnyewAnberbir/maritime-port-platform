import { AuditTrail } from "../audit/trail";
import { exportMppk, type MppkManifest } from "../export/mppkManifest";
import { CallSearchIndex } from "../index/callSearch";
import { Journal, type JournalDraft, type JournalEvent } from "../journal/log";
import { applyEvent } from "../journal/replay";
import { Metrics } from "../observe/metrics";
import { TransitionPolicy } from "../policy/transitions";
import { projectPort, type PortView } from "../projection/portView";
import { reconcile, type ReconcileReport } from "../reconcile/engine";
import { recover, takeCheckpoint, type Checkpoint } from "../recovery/checkpoint";
import { CanonicalStore } from "../store/canonical";
import type { CallRow, CallState, IsoSize, Risk } from "../types/call";
import { defaultReference } from "../vessel/call";
import { runCompactJob, type CompactJob } from "../workers/compactWorker";

const STAMP = "1970-01-01T00:00:00.000Z";

export type Command =
  | {
      type: "announce";
      name: string;
      imo: string;
      eta: string;
      draftDm: number;
      reference?: string;
      risk?: Risk;
      flagged?: boolean;
    }
  | { type: "assignBerth"; callId: number; berthId: string; startMin: number; endMin: number; flags?: number }
  | { type: "advanceCall"; callId: number; next: CallState }
  | {
      type: "fileDocket";
      callId: number;
      box: string;
      isoSize: IsoSize;
      vgmKg: number;
      tareKg: number;
      laden: boolean;
      hazmatClass?: string;
    }
  | { type: "declareVgm"; box: string; vgmKg: number }
  | { type: "gateIn"; callId: number; box: string; chassis: string; movedOn?: string }
  | { type: "gateOut"; callId: number; box: string; chassis: string; movedOn?: string }
  | { type: "stackBox"; box: string; block: string; bay: number; row: number; tier: number }
  | { type: "loadBox"; box: string }
  | { type: "holdCustoms"; callId: number; box: string; reason: string; openedOn?: string }
  | { type: "releaseCustoms"; holdId: number; releasedOn?: string }
  | { type: "flag"; callId: number; flagged: boolean }
  | { type: "seal"; callId: number }
  | { type: "recover"; callId: number }
  | { type: "compact" }
  | { type: "extendWindow"; windowId: number; endMin: number; flags?: number };

export class PortDesk {
  readonly store = new CanonicalStore();
  readonly journal = new Journal();
  readonly index = new CallSearchIndex();
  readonly audit = new AuditTrail();
  readonly metrics = new Metrics();
  private readonly policy = new TransitionPolicy();
  view: PortView;

  constructor() {
    this.view = projectPort(this.store);
  }

  rows(): CallRow[] {
    return this.store.rows();
  }

  dispatch(command: Command): JournalEvent[] {
    const planned = this.plan(command);
    const recorded: JournalEvent[] = [];
    for (const draft of planned) {
      const event = this.journal.append(draft);
      applyEvent(this.store, event);
      recorded.push(event);
    }
    this.refresh(command, recorded);
    return recorded;
  }

