import { projectPort, type PortView } from "../projection/portView";
import type { CanonicalStore } from "../store/canonical";

export type ReconcileReport = {
  matched: boolean;
  rebuilt: boolean;
  drift: string[];
};

export function compareView(store: CanonicalStore, view: PortView): string[] {
  const fresh = projectPort(store);
  const drift: string[] = [];
  const keys: Array<keyof PortView> = [
    "callCount",
    "alongsideCount",
    "workingCount",
    "openHoldCount",
    "yardUsed",
    "yardCapacity",
    "docketCount",
    "flaggedCount",
    "sealedCount",
    "liveWindowCount",
    "storeGeneration",
  ];
  for (const key of keys) {
    if (fresh[key] !== view[key]) {
      drift.push(`${key}:${view[key]}->${fresh[key]}`);
    }
  }
  return drift;
}

export function reconcile(store: CanonicalStore, view: PortView): { view: PortView; report: ReconcileReport } {
  const drift = compareView(store, view);
  if (drift.length === 0) {
    return { view, report: { matched: true, rebuilt: false, drift } };
