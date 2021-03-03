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
          eta: "2015-03-11T06:00:00.000Z",
          boxes: 1,
        },
      ],
      new Map([[1, ["MSCU1000007"]]]),
    );
    expect(index.search("MP-0001")[0]?.field).toBe("reference");
    expect(index.search("harbor")[0]?.field).toBe("vessel");
    expect(index.search("B-12")[0]?.field).toBe("berth");
    expect(index.search("MSCU1000007")[0]?.field).toBe("box");
  });
});
