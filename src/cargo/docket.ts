import type { IsoSize } from "../types/call";

export type DocketState = "planned" | "gated_in" | "stacked" | "held" | "loaded" | "departed";

export type CargoDocket = {
  id: number;
  callId: number;
  box: string;
  isoSize: IsoSize;
  vgmKg: number;
  tareKg: number;
  laden: boolean;
  hazmatClass: string;
  state: DocketState;
};

const ISO_BOX = /^[A-Z]{3}U[0-9]{7}$/;
const MAX_VGM: Record<IsoSize, number> = {
  "20": 30480,
  "40": 32500,
  "45": 32500,
};

export function isIsoBox(box: string): boolean {
  return ISO_BOX.test(box);
}

export function assertIsoBox(box: string): void {
  if (!isIsoBox(box)) {
    throw new Error(`box ${box} is not an ISO 6346 owner/serial`);
  }
}

export function assertHazmatClass(hazmatClass: string): void {
  if (hazmatClass === "") {
    return;
  }
  if (!/^[1-9](\.[1-6])?$/.test(hazmatClass)) {
    throw new Error(`hazmat class ${hazmatClass} is not an IMDG division`);
  }
}

/** SOLAS VGM: laden boxes need verified mass above tare; empty may equal tare. */
export function vgmAcceptable(docket: Pick<CargoDocket, "vgmKg" | "tareKg" | "laden" | "isoSize">): boolean {
  if (docket.tareKg <= 0 || docket.tareKg > 8000) {
    return false;
  }
  if (docket.vgmKg > MAX_VGM[docket.isoSize]) {
    return false;
  }
  if (!docket.laden) {
    return docket.vgmKg === docket.tareKg;
  }
  return docket.vgmKg >= docket.tareKg + 100;
}

export function assertVgm(docket: Pick<CargoDocket, "vgmKg" | "tareKg" | "laden" | "isoSize" | "box">): void {
  if (!vgmAcceptable(docket)) {
    throw new Error(`box ${docket.box} VGM ${docket.vgmKg} kg fails SOLAS check`);
  }
}

export function fileDocket(input: {
  id: number;
  callId: number;
  box: string;
  isoSize: IsoSize;
