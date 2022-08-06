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
    risk: "medium",
    flagged: true,
    eta: "2015-03-11T06:00:00.000Z",
    boxes: 2,
  },
  {
    id: 2,
    reference: "MP-0002",
    vessel: "Cedar Wave",
    berth: "Q-3",
    state: "announced",
    risk: "low",
    flagged: false,
    eta: "2015-03-11T09:30:00.000Z",
    boxes: 0,
  },
];

describe("call filter", () => {
  it("filters by query, state, and flaggedOnly", () => {
