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
      vgmKg: number;
      tareKg: number;
      laden: boolean;
      hazmatClass: string;
    }
  | {
      seq: number;
      kind: "declare-vgm";
      box: string;
      vgmKg: number;
    }
  | {
      seq: number;
      kind: "gate-in";
      moveId: number;
      callId: number;
      box: string;
      chassis: string;
      movedOn: string;
    }
  | {
      seq: number;
      kind: "gate-out";
      moveId: number;
      callId: number;
      box: string;
      chassis: string;
      movedOn: string;
    }
  | {
      seq: number;
      kind: "stack-box";
      box: string;
      block: string;
      bay: number;
      row: number;
      tier: number;
    }
  | {
      seq: number;
      kind: "load-box";
      box: string;
    }
  | {
      seq: number;
      kind: "hold-customs";
      holdId: number;
      callId: number;
      box: string;
      reason: string;
      openedOn: string;
    }
  | {
      seq: number;
      kind: "release-customs";
      holdId: number;
      releasedOn: string;
    }
  | {
      seq: number;
      kind: "flag";
      callId: number;
      flagged: boolean;
    }
  | {
      seq: number;
      kind: "seal";
      callId: number;
    }
  | {
      seq: number;
      kind: "recover";
      callId: number;
    }
  | {
      seq: number;
      kind: "compact";
      keptSlots: number;
      droppedSlots: number;
    }
  | {
      seq: number;
      kind: "extend-window";
      windowId: number;
      endMin: number;
      flags: number;
    }
  | {
      seq: number;
      kind: "cargo-state";
      box: string;
      from: DocketState;
      to: DocketState;
    };

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

export type JournalDraft = DistributiveOmit<JournalEvent, "seq"> & { seq?: number };

export class Journal {
  private events: JournalEvent[] = [];
  private nextSeq = 1;

  append(event: JournalDraft): JournalEvent {
    const seq = event.seq ?? this.nextSeq;
    const recorded = { ...event, seq } as JournalEvent;
    this.events.push(recorded);
    this.nextSeq = Math.max(this.nextSeq, seq + 1);
    return recorded;
  }

  all(): JournalEvent[] {
    return this.events.map(cloneEvent);
  }

  since(seq: number): JournalEvent[] {
    return this.events.filter((event) => event.seq > seq).map(cloneEvent);
  }

  lastSeq(): number {
    return this.nextSeq - 1;
  }

  length(): number {
    return this.events.length;
  }

  replace(events: JournalEvent[]): void {
    this.events = events.map(cloneEvent);
    this.nextSeq = this.events.reduce((max, event) => Math.max(max, event.seq), 0) + 1;
  }
}

function cloneEvent(event: JournalEvent): JournalEvent {
  return { ...event };
}
