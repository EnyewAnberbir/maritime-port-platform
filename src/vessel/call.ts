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
  return acc % 10 === Number(imo[6]);
}

export function assertImo(imo: string): void {
  if (!imoChecksumOk(imo)) {
    throw new Error(`IMO ${imo} fails identification checksum`);
  }
}

export function announceCall(input: {
  id: number;
  reference: string;
  imo: string;
  name: string;
  eta: string;
  draftDm: number;
  risk?: Risk;
  flagged?: boolean;
}): VesselCall {
  assertImo(input.imo);
