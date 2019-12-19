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
