export type AuditKind = "lifecycle" | "export" | "reconcile" | "recovery" | "compact";

export type AuditEvent = {
  seq: number;
  kind: AuditKind;
  summary: string;
  generation: number;
};

export class AuditTrail {
  private events: AuditEvent[] = [];
  private nextSeq = 1;

  record(kind: AuditKind, summary: string, generation: number): AuditEvent {
    const event: AuditEvent = {
      seq: this.nextSeq,
      kind,
      summary,
      generation,
    };
    this.nextSeq += 1;
    this.events.push(event);
    return event;
  }

  all(): AuditEvent[] {
    return this.events.map((event) => ({ ...event }));
  }

  ofKind(kind: AuditKind): AuditEvent[] {
    return this.events.filter((event) => event.kind === kind).map((event) => ({ ...event }));
  }

  length(): number {
    return this.events.length;
  }
}
