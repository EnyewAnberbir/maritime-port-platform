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
        id: event.docketId,
        callId: event.callId,
        box: event.box,
        isoSize: event.isoSize,
        vgmKg: event.vgmKg,
        tareKg: event.tareKg,
        laden: event.laden,
        hazmatClass: event.hazmatClass,
      });
      store.bump();
      return;
    case "declare-vgm": {
      const current = store.dockets.require(event.box);
      store.dockets.put(declareVgm(current, event.vgmKg));
      store.bump();
      return;
    }
    case "gate-in":
      store.applyGateIn({
        moveId: event.moveId,
        callId: event.callId,
        box: event.box,
        chassis: event.chassis,
        movedOn: event.movedOn,
      });
      store.bump();
      return;
    case "gate-out":
      store.applyGateOut({
        moveId: event.moveId,
        callId: event.callId,
        box: event.box,
        chassis: event.chassis,
        movedOn: event.movedOn,
      });
      store.bump();
      return;
    case "stack-box":
      store.applyStack(event.box, event.block, event.bay, event.row, event.tier);
      store.bump();
      return;
    case "load-box":
      store.applyLoad(event.box);
      store.bump();
      return;
    case "hold-customs":
      store.applyHold({
        holdId: event.holdId,
        callId: event.callId,
        box: event.box,
        reason: event.reason,
        openedOn: event.openedOn,
      });
      store.bump();
      return;
    case "release-customs":
      store.applyRelease(event.holdId, event.releasedOn);
      store.bump();
      return;
    case "flag":
      store.calls.patch(event.callId, { flagged: event.flagged });
      store.bump();
      return;
    case "seal":
      store.calls.patch(event.callId, { sealed: true });
      store.bump();
      return;
    case "recover": {
      const call = store.require(event.callId);
      store.calls.patch(event.callId, {
        sealed: false,
        flagged: false,
        risk: call.risk === "high" ? "medium" : call.risk,
      });
      store.bump();
      return;
    }
    case "compact": {
      store.yard.compact();
      store.bump();
