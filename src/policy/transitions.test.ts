import { describe, expect, it } from "vitest";
import { canCall, canCargo, TransitionPolicy } from "./transitions";

describe("vessel and cargo transitions", () => {
  it("allows announced -> inbound -> alongside -> working -> departed", () => {
    expect(canCall("announced", "inbound")).toBe(true);
    expect(canCall("inbound", "alongside")).toBe(true);
    expect(canCall("alongside", "working")).toBe(true);
    expect(canCall("working", "departed")).toBe(true);
    expect(canCall("working", "cancelled")).toBe(false);
    expect(canCall("departed", "announced")).toBe(false);
  });

  it("rejects an illegal cargo hop", () => {
    expect(canCargo("planned", "loaded")).toBe(false);
    const policy = new TransitionPolicy();
    expect(() => policy.rejectCall("working", "cancelled", "cancel")).toThrow(/cannot cancel/);
  });
});
