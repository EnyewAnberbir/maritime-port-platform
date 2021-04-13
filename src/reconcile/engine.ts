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
