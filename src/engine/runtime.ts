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

  exportManifest(): MppkManifest {
    const before = this.store.generation;
    const manifest = exportMppk(this.store);
    if (this.store.generation !== before) {
      throw new Error("export mutated the canonical store");
    }
    this.audit.record("export", `mppk calls=${manifest.callCount}`, before);
    this.metrics.record({ exportBytes: manifest.bytes.length });
    return manifest;
  }

  checkpoint(): Checkpoint {
    const checkpoint = takeCheckpoint(this.store, this.journal.lastSeq());
    this.audit.record("recovery", `checkpoint seq=${checkpoint.journalSeq}`, this.store.generation);
    return checkpoint;
  }

  restore(checkpoint: Checkpoint, tail: JournalEvent[] = []): void {
    const recovered = recover(checkpoint, tail);
    this.store.hydrate(recovered.snapshot());
    const events = [
      ...this.journal.all().filter((event) => event.seq <= checkpoint.journalSeq),
      ...tail.filter((event) => event.seq > checkpoint.journalSeq),
    ].sort((a, b) => a.seq - b.seq);
    this.journal.replace(events);
    this.view = projectPort(this.store);
    this.rebuildIndex();
    this.audit.record("recovery", `restore seq=${checkpoint.journalSeq} tail=${tail.length}`, this.store.generation);
    this.syncMetrics();
  }

  converge(): ReconcileReport {
    const { view, report } = reconcile(this.store, this.view);
    this.view = view;
    this.audit.record("reconcile", report.matched ? "matched" : "rebuilt", this.store.generation);
    this.metrics.setLag(this.store.generation, this.view.storeGeneration);
    return report;
  }

  compactJob(id: string): CompactJob {
    const job = runCompactJob(
      { id, stage: "pending", inputHash: "", kept: 0, dropped: 0, slots: [] },
      this.store.yard.all(),
    );
    if (job.dropped > 0) {
      this.store.yard.hydrate(job.slots);
      this.store.bump();
    }
    this.metrics.bumpCompact();
    this.audit.record("compact", `job ${id} dropped=${job.dropped}`, this.store.generation);
    this.view = projectPort(this.store);
    return job;
  }

  private plan(command: Command): JournalDraft[] {
    switch (command.type) {
      case "announce": {
        const id = this.store.calls.peekNextId();
        return [
          {
            kind: "announce",
            callId: id,
            reference: command.reference ?? defaultReference(id),
            imo: command.imo,
            name: command.name,
            eta: command.eta,
            draftDm: command.draftDm,
            risk: command.risk ?? "low",
            flagged: command.flagged ?? false,
          },
        ];
      }
      case "assignBerth": {
        this.requireCall(command.callId);
        return [
          {
            kind: "assign-berth",
            callId: command.callId,
            windowId: this.store.windows.peekNextId(),
            berthId: command.berthId,
            startMin: command.startMin,
            endMin: command.endMin,
            flags: command.flags ?? 0,
          },
        ];
      }
      case "advanceCall": {
        const call = this.requireCall(command.callId);
        this.policy.rejectCall(call.state, command.next, "advance");
        return [{ kind: "advance-call", callId: command.callId, from: call.state, to: command.next }];
      }
      case "fileDocket":
        this.requireCall(command.callId);
        return [
          {
            kind: "file-docket",
            docketId: this.store.dockets.peekNextId(),
            callId: command.callId,
            box: command.box,
            isoSize: command.isoSize,
            vgmKg: command.vgmKg,
            tareKg: command.tareKg,
            laden: command.laden,
            hazmatClass: command.hazmatClass ?? "",
          },
        ];
      case "declareVgm":
        this.store.dockets.require(command.box);
        return [{ kind: "declare-vgm", box: command.box, vgmKg: command.vgmKg }];
      case "gateIn":
        this.requireCall(command.callId);
        return [
          {
            kind: "gate-in",
            moveId: this.store.gate.peekNextId(),
            callId: command.callId,
            box: command.box,
            chassis: command.chassis,
            movedOn: command.movedOn ?? STAMP,
          },
        ];
      case "gateOut":
        this.requireCall(command.callId);
        return [
          {
            kind: "gate-out",
            moveId: this.store.gate.peekNextId(),
            callId: command.callId,
            box: command.box,
            chassis: command.chassis,
            movedOn: command.movedOn ?? STAMP,
          },
        ];
      case "stackBox":
        this.store.dockets.require(command.box);
        return [
          {
            kind: "stack-box",
            box: command.box,
            block: command.block,
            bay: command.bay,
            row: command.row,
            tier: command.tier,
          },
        ];
      case "loadBox":
        this.store.dockets.require(command.box);
        return [{ kind: "load-box", box: command.box }];
      case "holdCustoms":
        this.requireCall(command.callId);
        return [
          {
            kind: "hold-customs",
            holdId: this.store.customs.peekNextId(),
            callId: command.callId,
            box: command.box,
            reason: command.reason,
            openedOn: command.openedOn ?? STAMP,
          },
        ];
      case "releaseCustoms":
        this.store.customs.require(command.holdId);
        return [
          {
            kind: "release-customs",
            holdId: command.holdId,
            releasedOn: command.releasedOn ?? STAMP,
          },
        ];
      case "flag":
        this.requireCall(command.callId);
        return [{ kind: "flag", callId: command.callId, flagged: command.flagged }];
      case "seal":
        this.requireCall(command.callId);
        return [{ kind: "seal", callId: command.callId }];
      case "recover":
        this.requireCall(command.callId);
        return [{ kind: "recover", callId: command.callId }];
      case "compact": {
        const slots = this.store.yard.all();
        const dropped = slots.filter((slot) => !slot.box && slot.abandoned).length;
        return [{ kind: "compact", keptSlots: slots.length - dropped, droppedSlots: dropped }];
      }
      case "extendWindow":
        this.store.windows.require(command.windowId);
        return [
          {
            kind: "extend-window",
            windowId: command.windowId,
            endMin: command.endMin,
            flags: command.flags ?? 0,
          },
        ];
    }
  }

  private refresh(command: Command, events: JournalEvent[]): void {
    this.view = projectPort(this.store);
    // Berth reassignment, window extend, and flag updates leave the search
    // projection on the previous generation. Later lookup/export observers
