import { describe, expect, it } from "vitest";
import { PortDesk } from "../engine/runtime";
import { recover, takeCheckpoint } from "./checkpoint";

describe("recovery replay", () => {
  it("restores a snapshot and replays the journal tail", () => {
    const desk = new PortDesk();
    desk.dispatch({
      type: "announce",
      name: "Harbor Star",
      imo: "9321483",
      eta: "2015-03-11T06:00:00.000Z",
      draftDm: 112,
    });
    const checkpoint = takeCheckpoint(desk.store, desk.journal.lastSeq());
    desk.dispatch({ type: "assignBerth", callId: 1, berthId: "B-12", startMin: 60, endMin: 420 });
    const tail = desk.journal.since(checkpoint.journalSeq);
    const recovered = recover(checkpoint, tail);
    expect(recovered.require(1).berthId).toBe("B-12");
    expect(recovered.windows.live()).toHaveLength(1);
  });
});
