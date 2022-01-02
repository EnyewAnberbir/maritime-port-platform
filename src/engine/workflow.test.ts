import { describe, expect, it } from "vitest";
import { encodeUtf8 } from "../lib/bytes";
import { encode, Op } from "../wire/codec";
import { processMppkBytes } from "./workflow";

describe("MPPK workflow", () => {
  it("decodes an envelope, builds a session, and returns stats", () => {
    const bytes = encode({
      version: 1,
      flags: 0,
      records: [
        { op: Op.vessel, key: 1, aux: 112, payload: encodeUtf8("Harbor Star") },
        { op: Op.berth, key: 1, aux: 1, payload: encodeUtf8("B-12") },
        { op: Op.seal, key: 1, aux: 0, payload: encodeUtf8("seal") },
        { op: Op.recover, key: 1, aux: 0, payload: encodeUtf8("recover") },
        { op: Op.compact, key: 1, aux: 0, payload: encodeUtf8("compact") },
      ],
    });
    const stats = processMppkBytes(bytes);
    expect(stats.sections).toBe(5);
    expect(stats.vessels).toBe(1);
    expect(stats.seals).toBe(1);
    expect(stats.cancel_armed).toBe(true);
    expect(stats.recovered).toBe(true);
    expect(stats.compacted).toBe(true);
    expect(stats.digest).toBeGreaterThan(0);
