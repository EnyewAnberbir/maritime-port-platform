import { describe, expect, it } from "vitest";
import { Metrics } from "./metrics";

describe("metrics", () => {
  it("records harbor counters and projection lag", () => {
    const metrics = new Metrics();
    metrics.record({ callCount: 16, openHoldCount: 1, yardUsed: 2, journalLength: 40 });
    expect(metrics.setLag(12, 10)).toBe(2);
    expect(metrics.bumpCompact()).toBe(1);
    expect(metrics.snapshot()).toMatchObject({
      callCount: 16,
      openHoldCount: 1,
      yardUsed: 2,
      projectionLag: 2,
      compactPasses: 1,
    });
  });
});
