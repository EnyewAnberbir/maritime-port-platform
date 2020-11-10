import { describe, expect, it } from "vitest";
import { CanonicalStore } from "./canonical";

describe("canonical store", () => {
  it("keeps calls, windows, and dockets under one generation counter", () => {
    const store = new CanonicalStore();
    store.applyAnnounce({
      id: 1,
      reference: "MP-0001",
      imo: "9321483",
      name: "Harbor Star",
      eta: "2015-03-11T06:00:00.000Z",
      draftDm: 112,
    });
    store.bump();
    store.applyAssignBerth({
      callId: 1,
      windowId: 1,
      berthId: "B-12",
      startMin: 60,
      endMin: 420,
      flags: 0,
    });
    store.bump();
    store.applyDocket({
      id: 1,
      callId: 1,
      box: "MSCU1000007",
      isoSize: "40",
      vgmKg: 18200,
      tareKg: 3780,
      laden: true,
    });
    store.bump();
    expect(store.generation).toBe(3);
    expect(store.rows()[0]?.berth).toBe("B-12");
    expect(store.rows()[0]?.boxes).toBe(1);
  });
});
