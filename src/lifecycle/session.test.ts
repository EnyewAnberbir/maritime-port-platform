import { describe, expect, it } from "vitest";
import { encodeUtf8 } from "../lib/bytes";
import { Op, type MppkEnvelope } from "../wire/codec";
import { buildSession } from "./session";

function envelope(ops: number[]): MppkEnvelope {
  return {
    version: 1,
    flags: 0,
    checksum: 0,
    records: ops.map((op, key) => ({
      op,
      key,
      aux: 0,
      payload: encodeUtf8(`p${key}`),
    })),
  };
}

describe("session marks", () => {
  it("counts Zig ops and arms cancel after recover then compact", () => {
    const session = buildSession(
      envelope([Op.vessel, Op.berth, Op.cargo, Op.seal, Op.recover, Op.compact, Op.extend]),
    );
    expect(session.vessels).toBe(1);
    expect(session.berths).toBe(1);
    expect(session.cargos).toBe(1);
    expect(session.seals).toBe(1);
    expect(session.recovers).toBe(1);
    expect(session.compacts).toBe(1);
    expect(session.extends_after_seal).toBe(1);
    expect(session.cancel_armed).toBe(true);
    expect(session.first_compact_after_recover).toBeGreaterThan(session.first_recover_index);
  });

