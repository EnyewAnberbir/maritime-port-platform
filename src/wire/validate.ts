import { readU16LE } from "../lib/bytes";
import {
  decode,
  MPPK_HEADER_SIZE,
  MPPK_MAGIC,
  MPPK_MAX_RECORDS,
  MPPK_RECORD_HEADER_SIZE,
  type MppkEnvelope,
} from "./codec";

export type WireIssue = {
  code: "magic" | "truncated" | "overlap" | "count" | "empty";
  message: string;
};

export function validateMagic(data: Uint8Array): boolean {
  return (
    data.length >= 4 &&
    data[0] === MPPK_MAGIC[0] &&
    data[1] === MPPK_MAGIC[1] &&
    data[2] === MPPK_MAGIC[2] &&
    data[3] === MPPK_MAGIC[3]
  );
}

export function validateEnvelope(data: Uint8Array): WireIssue[] {
