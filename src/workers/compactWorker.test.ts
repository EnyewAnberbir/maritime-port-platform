import { describe, expect, it } from "vitest";
import { runCompactJob } from "./compactWorker";

describe("compact worker", () => {
  it("is idempotent once the yard is already compacted", () => {
    const slots = [
      { block: "RTG-A", bay: 1, row: 1, tier: 1, box: "MSCU1000007", abandoned: false },
      { block: "RTG-A", bay: 1, row: 1, tier: 2, box: null, abandoned: true },
    ];
    const first = runCompactJob(
      { id: "yard-1", stage: "pending", inputHash: "", kept: 0, dropped: 0, slots: [] },
      slots,
    );
    expect(first.dropped).toBe(1);
    expect(first.kept).toBe(1);
    const second = runCompactJob(first, first.slots);
    expect(second.dropped).toBe(0);
    expect(second.kept).toBe(1);
  });
});
