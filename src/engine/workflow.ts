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

export function finishWorkflow(envelope: MppkEnvelope, session: PortSession): WorkflowStats {
  const plan = foldBerthMetrics(
    session.vessels,
    session.berths * 40 + 200,
    session.cargos * 80 + 400,
    session.extends + 1,
  );
  let rebuildRounds = session.seals > session.compacts ? session.seals : session.compacts;
  if (rebuildRounds < 2) {
    rebuildRounds = 2;
  }
  rebuildRounds += session.gens < 3 ? session.gens : 3;
  rebuildRounds += 3;
  let insertBurst = session.vessels * 2 + session.berths + session.cargos + session.extends;
  if (insertBurst < 4) {
    insertBurst = 4;
  }
  let acc = (plan ^ session.payload_bytes) >>> 0;
  for (let round = 0; round < rebuildRounds; round += 1) {
    acc = (acc + insertBurst + session.seals + round) >>> 0;
  }
  const fold = acc ^ (session.customs_cnt * 17);
  return {
    sections: envelope.records.length,
    vessels: session.vessels,
    seals: session.seals,
    payload_bytes: session.payload_bytes,
    digest:
      (envelope.checksum ^
        session.payload_bytes ^
        session.extends_after_seal ^
        fold ^
        session.vessels ^
        session.gens) >>>
      0,
    cancel_armed: session.cancel_armed,
    compacted: session.cancel_armed || session.compacts > 0,
    recovered: session.recovers > 0,
  };
}

function quietStats(): WorkflowStats {
  return {
    sections: 0,
    vessels: 0,
    seals: 0,
    payload_bytes: 0,
    digest: 0,
    cancel_armed: false,
    compacted: false,
    recovered: false,
  };
}
