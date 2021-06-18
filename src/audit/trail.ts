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
