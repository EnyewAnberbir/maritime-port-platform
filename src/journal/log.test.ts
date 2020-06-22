import { describe, expect, it } from "vitest";
import { Journal } from "./log";

describe("journal log", () => {
  it("assigns rising sequence numbers and clones on read", () => {
    const journal = new Journal();
    const first = journal.append({
      kind: "announce",
      callId: 1,
      reference: "MP-0001",
      imo: "9321483",
      name: "Harbor Star",
      eta: "2015-03-11T06:00:00.000Z",
      draftDm: 112,
      risk: "low",
      flagged: false,
    });
    const second = journal.append({ kind: "flag", callId: 1, flagged: true });
    expect(first.seq).toBe(1);
    expect(second.seq).toBe(2);
    expect(journal.since(1)).toHaveLength(1);
    const copy = journal.all()[0];
    if (copy && copy.kind === "announce") {
      copy.name = "mutated";
    }
    expect(journal.all()[0]).toMatchObject({ name: "Harbor Star" });
  });
});
