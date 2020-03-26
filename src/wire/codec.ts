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
  export_op: 10,
} as const;

export type OpCode = (typeof Op)[keyof typeof Op];

export type MppkRecord = {
  op: number;
  key: number;
  aux: number;
  payload: Uint8Array;
};

export type MppkEnvelope = {
  version: number;
  flags: number;
  records: MppkRecord[];
  checksum: number;
};

export function encode(envelope: Omit<MppkEnvelope, "checksum"> | MppkEnvelope): Uint8Array {
  if (envelope.records.length > MPPK_MAX_RECORDS) {
    throw new Error("too many MPPK records");
  }
  const bytes: number[] = [MPPK_MAGIC[0]!, MPPK_MAGIC[1]!, MPPK_MAGIC[2]!, MPPK_MAGIC[3]!];
  writeU16LE(bytes, envelope.version);
  writeU16LE(bytes, envelope.flags);
  writeU16LE(bytes, envelope.records.length);
  for (const record of envelope.records) {
    bytes.push(record.op & 0xff, 0, 0, 0);
    writeU32LE(bytes, record.key);
    writeU32LE(bytes, record.aux);
    writeU16LE(bytes, record.payload.length);
    for (let i = 0; i < record.payload.length; i += 1) {
      bytes.push(record.payload[i]!);
    }
  }
  return new Uint8Array(bytes);
}

export function decode(data: Uint8Array): MppkEnvelope {
  if (data.length < MPPK_HEADER_SIZE) {
    throw new Error("bad header");
  }
  if (
    data[0] !== MPPK_MAGIC[0] ||
    data[1] !== MPPK_MAGIC[1] ||
    data[2] !== MPPK_MAGIC[2] ||
    data[3] !== MPPK_MAGIC[3]
  ) {
    throw new Error("bad header");
  }
  const version = readU16LE(data, 4);
  const flags = readU16LE(data, 6);
  const count = readU16LE(data, 8);
  if (count > MPPK_MAX_RECORDS) {
    throw new Error("record count exceeds MPPK limit");
  }
  const records: MppkRecord[] = [];
  let offset = MPPK_HEADER_SIZE;
  for (let i = 0; i < count; i += 1) {
