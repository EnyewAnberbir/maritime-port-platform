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
