import { describe, expect, it } from "vitest";
import { assertVgm, fileDocket, vgmAcceptable } from "./docket";

describe("cargo VGM", () => {
  it("accepts a laden SOLAS VGM above tare", () => {
    const docket = fileDocket({
      id: 1,
      callId: 1,
      box: "MSCU1000007",
      isoSize: "40",
      vgmKg: 18200,
      tareKg: 3780,
      laden: true,
    });
    expect(vgmAcceptable(docket)).toBe(true);
    expect(docket.state).toBe("planned");
  });

  it("rejects a laden box whose VGM equals tare", () => {
    expect(() =>
      assertVgm({
        box: "MSCU1000018",
        isoSize: "20",
        vgmKg: 2200,
        tareKg: 2200,
        laden: true,
      }),
    ).toThrow(/SOLAS/);
  });
