import { describe, expect, it } from "vitest";
import { PortDesk } from "../engine/runtime";
import { replay } from "./replay";

describe("journal replay determinism", () => {
  it("rebuilds the same store from the same events twice", () => {
    const desk = new PortDesk();
    desk.dispatch({
      type: "announce",
      name: "Harbor Star",
      imo: "9321483",
      eta: "2015-03-11T06:00:00.000Z",
      draftDm: 112,
    });
    desk.dispatch({ type: "assignBerth", callId: 1, berthId: "B-12", startMin: 60, endMin: 420 });
    desk.dispatch({
      type: "fileDocket",
      callId: 1,
      box: "MSCU1000007",
      isoSize: "40",
      vgmKg: 18200,
      tareKg: 3780,
      laden: true,
    });
    const events = desk.journal.all();
    const first = replay(events);
    const second = replay(events);
    expect(first.snapshot()).toEqual(second.snapshot());
    expect(first.generation).toBe(desk.store.generation);
    expect(first.require(1).name).toBe("Harbor Star");
  });
});
