import { declareVgm } from "../cargo/docket";
import { extendWindow } from "../berth/window";
import { CanonicalStore } from "../store/canonical";
import type { JournalEvent } from "./log";

export function replay(events: JournalEvent[], store = new CanonicalStore()): CanonicalStore {
  const ordered = events.slice().sort((a, b) => a.seq - b.seq);
  for (const event of ordered) {
    applyEvent(store, event);
  }
  return store;
}

export function applyEvent(store: CanonicalStore, event: JournalEvent): void {
  switch (event.kind) {
    case "announce": {
      const created = store.applyAnnounce({
        id: event.callId,
        reference: event.reference,
        imo: event.imo,
        name: event.name,
        eta: event.eta,
        draftDm: event.draftDm,
        risk: event.risk,
        flagged: event.flagged,
      });
      if (created.id !== event.callId) {
        throw new Error(`replay announce id drift expected ${event.callId} got ${created.id}`);
      }
      store.bump();
      return;
    }
    case "assign-berth":
      store.applyAssignBerth({
        callId: event.callId,
        windowId: event.windowId,
        berthId: event.berthId,
        startMin: event.startMin,
        endMin: event.endMin,
        flags: event.flags,
      });
      store.bump();
      return;
    case "advance-call":
      store.applyAdvance(event.callId, event.to);
      store.bump();
      return;
    case "file-docket":
      store.applyDocket({
