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
