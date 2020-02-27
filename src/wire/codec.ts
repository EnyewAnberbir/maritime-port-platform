import { readU16LE, readU32LE, writeU16LE, writeU32LE } from "../lib/bytes";
import { checksumToNumber, fnv1a64Mix } from "../lib/hash";

export const MPPK_MAGIC = new Uint8Array([0x4d, 0x50, 0x50, 0x4b]);
export const MPPK_HEADER_SIZE = 10;
export const MPPK_RECORD_HEADER_SIZE = 14;
export const MPPK_MAX_RECORDS = 4096;

export const Op = {
  none: 0,
  vessel: 1,
  berth: 2,
  cargo: 3,
  customs: 4,
  seal: 5,
  recover: 6,
  compact: 7,
  extend: 8,
  query: 9,
