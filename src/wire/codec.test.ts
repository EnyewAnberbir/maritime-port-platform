import { describe, expect, it } from "vitest";
import { decode, encode, envelopeChecksum, Op } from "./codec";

describe("MPPK codec roundtrip", () => {
  it("encodes and decodes vessel/berth/cargo records", () => {
    const draft = {
      version: 1,
      flags: 2,
      records: [
        { op: Op.vessel, key: 1, aux: 112, payload: new Uint8Array([1, 2, 3]) },
        { op: Op.berth, key: 9, aux: 1, payload: new Uint8Array([4]) },
        { op: Op.cargo, key: 3, aux: 1, payload: new Uint8Array([]) },
      ],
    };
    const bytes = encode(draft);
    const envelope = decode(bytes);
    expect(envelope.version).toBe(1);
    expect(envelope.flags).toBe(2);
    expect(envelope.records).toHaveLength(3);
    expect(envelope.records[0]?.op).toBe(Op.vessel);
    expect(envelope.records[1]?.key).toBe(9);
    expect(Array.from(envelope.records[0]!.payload)).toEqual([1, 2, 3]);
    expect(envelope.checksum).toBe(envelopeChecksum(draft.records));
  });
});
