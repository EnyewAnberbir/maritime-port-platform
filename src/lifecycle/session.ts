import { Op, type MppkEnvelope } from "../wire/codec";

export type PortSession = {
  vessels: number;
  berths: number;
  cargos: number;
  customs_cnt: number;
  seals: number;
  recovers: number;
  compacts: number;
  extends: number;
  extends_after_seal: number;
  gens: number;
  queries: number;
  payload_bytes: number;
  first_seal_index: number;
  first_recover_index: number;
  first_compact_after_recover: number;
  saw_seal: boolean;
  saw_recover: boolean;
  cancel_armed: boolean;
};

export function emptySession(): PortSession {
  return {
    vessels: 0,
    berths: 0,
    cargos: 0,
    customs_cnt: 0,
    seals: 0,
    recovers: 0,
    compacts: 0,
    extends: 0,
    extends_after_seal: 0,
    gens: 0,
    queries: 0,
    payload_bytes: 0,
    first_seal_index: 0,
    first_recover_index: 0,
    first_compact_after_recover: 0,
    saw_seal: false,
    saw_recover: false,
    cancel_armed: false,
  };
}

/** Port of Zig `lifecycle/session.buildSession`. */
export function buildSession(envelope: MppkEnvelope): PortSession {
  const session = emptySession();
  envelope.records.forEach((record, idx) => {
    session.payload_bytes += record.payload.length + 16;
    switch (record.op) {
      case Op.vessel:
        session.vessels += 1;
        break;
      case Op.berth:
        session.berths += 1;
        break;
      case Op.cargo:
        session.cargos += 1;
        break;
      case Op.customs:
        session.customs_cnt += 1;
        break;
      case Op.seal:
        session.seals += 1;
        session.gens += 1;
        if (!session.saw_seal) {
          session.saw_seal = true;
          session.first_seal_index = idx;
        }
        break;
      case Op.compact:
        session.compacts += 1;
        session.gens += 1;
        if (session.saw_recover && session.first_compact_after_recover === 0) {
          session.first_compact_after_recover = idx;
        }
        break;
      case Op.recover:
        session.recovers += 1;
        session.gens += 1;
        if (!session.saw_recover) {
          session.saw_recover = true;
          session.first_recover_index = idx;
        }
        break;
      case Op.extend:
        session.extends += 1;
        if (session.saw_seal) {
          session.extends_after_seal += 1;
        }
        break;
      case Op.query:
        session.queries += 1;
        break;
      case Op.export_op:
        session.gens += 1;
        break;
      default:
        break;
    }
  });
  session.payload_bytes += 10;
  session.cancel_armed = session.saw_recover && session.first_compact_after_recover > session.first_recover_index;
  return session;
}
