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
  const issues: WireIssue[] = [];
  if (data.length < MPPK_HEADER_SIZE) {
    issues.push({ code: "truncated", message: "header shorter than 10 bytes" });
    return issues;
  }
  if (!validateMagic(data)) {
    issues.push({ code: "magic", message: "expected MPPK magic" });
    return issues;
  }
  const count = readU16LE(data, 8);
  if (count > MPPK_MAX_RECORDS) {
    issues.push({ code: "count", message: `record count ${count} exceeds ${MPPK_MAX_RECORDS}` });
  }
  const spans: Array<{ start: number; end: number }> = [];
  let offset = MPPK_HEADER_SIZE;
  let parsed = 0;
  for (let i = 0; i < count; i += 1) {
    if (offset + MPPK_RECORD_HEADER_SIZE > data.length) {
      issues.push({ code: "truncated", message: `record ${i} header truncated` });
      break;
