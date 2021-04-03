import { describe, expect, it } from "vitest";
import { PortDesk } from "../engine/runtime";
import { projectPort } from "./portView";

describe("port view", () => {
  it("derives alongside, hold, and yard occupancy from the store", () => {
    const desk = new PortDesk();
    desk.dispatch({
      type: "announce",
      name: "Harbor Star",
      imo: "9321483",
      eta: "2015-03-11T06:00:00.000Z",
      draftDm: 112,
    });
    desk.dispatch({ type: "assignBerth", callId: 1, berthId: "B-12", startMin: 60, endMin: 420 });
    desk.dispatch({ type: "advanceCall", callId: 1, next: "inbound" });
    desk.dispatch({ type: "advanceCall", callId: 1, next: "alongside" });
    desk.dispatch({
      type: "fileDocket",
      callId: 1,
      box: "MSCU1000007",
      isoSize: "40",
      vgmKg: 18200,
      tareKg: 3780,
      laden: true,
    });
    desk.dispatch({ type: "gateIn", callId: 1, box: "MSCU1000007", chassis: "CH100001" });
    desk.dispatch({ type: "stackBox", box: "MSCU1000007", block: "RTG-A", bay: 1, row: 1, tier: 1 });
    desk.dispatch({ type: "holdCustoms", callId: 1, box: "MSCU1000007", reason: "scan" });
    const view = projectPort(desk.store);
    expect(view.callCount).toBe(1);
    expect(view.alongsideCount).toBe(1);
    expect(view.openHoldCount).toBe(1);
    expect(view.yardUsed).toBe(1);
    expect(view.docketCount).toBe(1);
  });
});
