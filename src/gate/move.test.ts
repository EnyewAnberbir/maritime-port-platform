import { describe, expect, it } from "vitest";
import { GateLog, recordMove } from "./move";

describe("gate moves", () => {
  it("requires chassis and an in before an out", () => {
    const log = new GateLog();
    expect(() =>
      recordMove({
        id: 1,
        direction: "in",
        box: "MSCU1000007",
        chassis: "bad",
        callId: 1,
        movedOn: "2015-03-11T08:00:00.000Z",
      }),
    ).toThrow(/chassis/);
    log.append(
      recordMove({
        id: 1,
        direction: "in",
        box: "MSCU1000007",
        chassis: "CH100001",
        callId: 1,
        movedOn: "2015-03-11T08:00:00.000Z",
      }),
    );
    expect(log.isInside("MSCU1000007")).toBe(true);
    expect(() =>
      log.append(
        recordMove({
          id: 2,
          direction: "in",
          box: "MSCU1000007",
          chassis: "CH100002",
          callId: 1,
          movedOn: "2015-03-11T09:00:00.000Z",
        }),
      ),
    ).toThrow(/already gated in/);
  });
});
