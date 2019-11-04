import { describe, expect, it } from "vitest";
import { YardMap } from "./stack";

describe("yard stacks", () => {
  it("places a box, lifts it, and drops the abandoned slot on compact", () => {
    const yard = new YardMap();
    yard.place("MSCU1000007", "RTG-A", 2, 1, 1);
    expect(yard.occupancy().used).toBe(1);
    yard.lift("MSCU1000007");
    expect(yard.occupancy().used).toBe(0);
    const result = yard.compact();
    expect(result.dropped).toBe(1);
    expect(yard.all()).toHaveLength(0);
  });

  it("rejects a second box in the same cell", () => {
    const yard = new YardMap();
    yard.place("MSCU1000007", "RTG-A", 2, 1, 1);
    expect(() => yard.place("MSCU2000001", "RTG-A", 2, 1, 1)).toThrow(/occupied/);
  });
});
