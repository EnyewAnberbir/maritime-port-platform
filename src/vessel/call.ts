import { toCallRow, type CallState, type Risk, type VesselCall } from "../types/call";

const IMO_BODY = /^[0-9]{7}$/;

/** ISO 9073 / IMO ship identification: seven digits, last is check. */
export function imoChecksumOk(imo: string): boolean {
  if (!IMO_BODY.test(imo)) {
    return false;
  }
  let acc = 0;
  for (let i = 0; i < 6; i += 1) {
    acc += Number(imo[i]) * (7 - i);
  }
