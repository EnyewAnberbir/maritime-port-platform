import { describe, expect, it } from "vitest";
import {
  acceptTransition,
  BERTH_FLAG_ALLOW_BACK,
  BERTH_FLAG_CAP_JUMP,
  BERTH_FLAG_REJECT_STAY,
  offerWindow,
  WindowBook,
  windowsOverlap,
} from "./window";

describe("berth overlap", () => {
  it("rejects two live windows on the same quay that overlap in time", () => {
    const book = new WindowBook();
    book.put(
      offerWindow({ id: 1, berthId: "B-12", callId: 1, startMin: 60, endMin: 420 }),
    );
    expect(() =>
      book.put(offerWindow({ id: 2, berthId: "B-12", callId: 2, startMin: 400, endMin: 700 })),
    ).toThrow(/overlaps/);
  });

  it("allows the same clock on a different berth", () => {
    expect(
      windowsOverlap(
        { berthId: "B-12", startMin: 0, endMin: 100 },
        { berthId: "Q-3", startMin: 0, endMin: 100 },
      ),
    ).toBe(false);
  });
});

describe("acceptTransition", () => {
  it("mirrors Zig generation flags", () => {
    expect(acceptTransition(8, 3, 0)).toBe(false);
    expect(acceptTransition(8, 3, BERTH_FLAG_ALLOW_BACK)).toBe(true);
    expect(acceptTransition(4, 4, 0)).toBe(true);
    expect(acceptTransition(4, 4, BERTH_FLAG_REJECT_STAY)).toBe(false);
    expect(acceptTransition(1, 70, 0)).toBe(true);
    expect(acceptTransition(1, 70, BERTH_FLAG_CAP_JUMP)).toBe(false);
    expect(acceptTransition(1, 60, BERTH_FLAG_CAP_JUMP)).toBe(true);
  });
});
