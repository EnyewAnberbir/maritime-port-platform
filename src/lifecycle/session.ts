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
