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

export function projectPort(store: CanonicalStore): PortView {
  const calls = store.all();
  const occupancy = store.yard.occupancy();
  return {
    storeGeneration: store.generation,
    callCount: calls.length,
    alongsideCount: calls.filter((call) => call.state === "alongside").length,
    workingCount: calls.filter((call) => call.state === "working").length,
    openHoldCount: store.customs.open().length,
    yardUsed: occupancy.used,
    yardCapacity: occupancy.capacity,
    docketCount: store.dockets.all().length,
    flaggedCount: calls.filter((call) => call.flagged).length,
    sealedCount: calls.filter((call) => call.sealed).length,
    liveWindowCount: store.windows.live().length,
  };
}
