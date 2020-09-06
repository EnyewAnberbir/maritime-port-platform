import { declareVgm } from "../cargo/docket";
import { extendWindow } from "../berth/window";
import { CanonicalStore } from "../store/canonical";
import type { JournalEvent } from "./log";

export function replay(events: JournalEvent[], store = new CanonicalStore()): CanonicalStore {
  const ordered = events.slice().sort((a, b) => a.seq - b.seq);
  for (const event of ordered) {
    applyEvent(store, event);
  }
