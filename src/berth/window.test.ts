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
