import { describe, expect, it } from "vitest";
import type { CallRow } from "../types/call";
import { applyCallFilter, filterLatencyMs } from "./useCallFilter";

const rows: CallRow[] = [
  {
    id: 1,
    reference: "MP-0001",
    vessel: "Harbor Star",
    berth: "B-12",
    state: "working",
