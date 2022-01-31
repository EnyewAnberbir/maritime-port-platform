import { foldBerthMetrics } from "../berth/window";
import { buildSession, type PortSession } from "../lifecycle/session";
import { decode, type MppkEnvelope } from "../wire/codec";
import { validateEnvelope } from "../wire/validate";

export type WorkflowStats = {
  sections: number;
  vessels: number;
  seals: number;
  payload_bytes: number;
  digest: number;
  cancel_armed: boolean;
  compacted: boolean;
  recovered: boolean;
};

export function processMppkBytes(data: Uint8Array): WorkflowStats {
  if (data.length > 400_000) {
    return quietStats();
  }
  const issues = validateEnvelope(data);
  let envelope: MppkEnvelope;
  try {
    envelope = decode(data);
  } catch {
    return quietStats();
  }
  if (issues.some((issue) => issue.code === "magic") && envelope.records.length === 0) {
    return quietStats();
  }
  const session = buildSession(envelope);
  return finishWorkflow(envelope, session);
}
