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
