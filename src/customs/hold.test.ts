import { describe, expect, it } from "vitest";
import { CustomsJournal, openHold, releaseHold } from "./hold";

describe("customs hold/release", () => {
  it("opens a hold and releases it once", () => {
    const journal = new CustomsJournal();
    const hold = journal.put(
      openHold({
        id: 1,
        callId: 1,
        box: "MSCU1000018",
        reason: "IMDG class 3 inspect",
        openedOn: "2015-03-11T08:00:00.000Z",
      }),
    );
    expect(journal.isHeld("MSCU1000018")).toBe(true);
    journal.put(releaseHold(hold, "2015-03-11T12:00:00.000Z"));
    expect(journal.isHeld("MSCU1000018")).toBe(false);
    expect(() => releaseHold(journal.require(1), "2015-03-11T13:00:00.000Z")).toThrow(/already released/);
  });
});
