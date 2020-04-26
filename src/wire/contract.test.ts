import { describe, expect, it } from "vitest";
import { readU16LE } from "../lib/bytes";
import { decode, encode, MPPK_MAGIC, Op } from "./codec";
import { validateEnvelope } from "./validate";

describe("MPPK contract", () => {
  it("requires magic MPPK, version u16 LE, flags u16 LE, and record count u16 LE", () => {
    const bytes = encode({
      version: 3,
      flags: 0x0100,
      records: [
        { op: Op.vessel, key: 7, aux: 0, payload: new Uint8Array([0x11]) },
        { op: Op.seal, key: 7, aux: 1, payload: new Uint8Array([0x22, 0x33]) },
      ],
    });
    expect(bytes[0]).toBe(0x4d);
    expect(bytes[1]).toBe(0x50);
    expect(bytes[2]).toBe(0x50);
    expect(bytes[3]).toBe(0x4b);
