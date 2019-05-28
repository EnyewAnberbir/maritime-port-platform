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

