import { describe, expect, it } from "vitest";
import { announceCall, assertImo, imoChecksumOk } from "./call";

describe("vessel calls", () => {
  it("accepts a legal announced call with a valid IMO", () => {
    const call = announceCall({
      id: 1,
      reference: "MP-0001",
      imo: "9321483",
      name: "Harbor Star",
      eta: "2015-03-11T06:00:00.000Z",
      draftDm: 112,
    });
    expect(call.state).toBe("announced");
    expect(imoChecksumOk("9321483")).toBe(true);
  });

  it("rejects a forged IMO and an impossible draft", () => {
    expect(() => assertImo("9321480")).toThrow(/checksum/);
    expect(() =>
      announceCall({
        id: 2,
        reference: "MP-0002",
        imo: "9321483",
        name: "Cedar Wave",
        eta: "2015-03-11T09:30:00.000Z",
        draftDm: 400,
      }),
    ).toThrow(/draft/);
  });
});
