import { describe, expect, it } from "vitest";
import { encode, Op } from "./codec";
import { validateEnvelope, validateMagic } from "./validate";

describe("MPPK validate", () => {
  it("flags a bad magic and a truncated record", () => {
    expect(validateMagic(new Uint8Array([0x4d, 0x50, 0x50, 0x4b]))).toBe(true);
    const issues = validateEnvelope(new Uint8Array([0x4d, 0x50, 0x50, 0x58, 1, 0, 0, 0, 0, 0]));
    expect(issues.some((issue) => issue.code === "magic")).toBe(true);
    const truncated = encode({
      version: 1,
      flags: 0,
      records: [{ op: Op.vessel, key: 1, aux: 0, payload: new Uint8Array([9, 8, 7]) }],
    });
    expect(validateEnvelope(truncated.slice(0, 12)).some((issue) => issue.code === "truncated")).toBe(true);
  });
});
