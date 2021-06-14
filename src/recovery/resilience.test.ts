import { describe, expect, it } from "vitest";
import { PortDesk } from "../engine/runtime";

describe("checkpoint resilience", () => {
  it("recovers extra journal events after a checkpoint", () => {
    const desk = new PortDesk();
    desk.dispatch({
      type: "announce",
      name: "Metro Tide",
      imo: "9311488",
      eta: "2015-03-12T04:15:00.000Z",
      draftDm: 121,
    });
    desk.dispatch({ type: "assignBerth", callId: 1, berthId: "Q-3", startMin: 90, endMin: 480 });
    const checkpoint = desk.checkpoint();
    const extra = [
      {
        seq: desk.journal.lastSeq() + 1,
        kind: "file-docket" as const,
        docketId: 1,
        callId: 1,
        box: "MSCU3000004",
        isoSize: "20" as const,
        vgmKg: 9800,
        tareKg: 2180,
        laden: true,
        hazmatClass: "",
      },
      {
        seq: desk.journal.lastSeq() + 2,
        kind: "flag" as const,
        callId: 1,
        flagged: true,
      },
    ];
    desk.restore(checkpoint, extra);
    expect(desk.store.dockets.require("MSCU3000004").callId).toBe(1);
    expect(desk.store.require(1).flagged).toBe(true);
    expect(desk.store.require(1).berthId).toBe("Q-3");
  });
});
