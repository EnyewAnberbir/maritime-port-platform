import type { CanonicalStore } from "../store/canonical";

export type PortView = {
  storeGeneration: number;
  callCount: number;
  alongsideCount: number;
  workingCount: number;
  openHoldCount: number;
  yardUsed: number;
  yardCapacity: number;
  docketCount: number;
  flaggedCount: number;
  sealedCount: number;
  liveWindowCount: number;
};

