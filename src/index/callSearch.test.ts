import { describe, expect, it } from "vitest";
import { CallSearchIndex } from "./callSearch";

describe("call search", () => {
  it("hits reference, vessel, berth, and box", () => {
    const index = new CallSearchIndex();
    index.rebuild(
      [
        {
          id: 1,
          reference: "MP-0001",
          vessel: "Harbor Star",
          berth: "B-12",
          state: "working",
          risk: "low",
          flagged: false,
