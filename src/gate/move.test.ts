import { describe, expect, it } from "vitest";
import { GateLog, recordMove } from "./move";

describe("gate moves", () => {
  it("requires chassis and an in before an out", () => {
    const log = new GateLog();
    expect(() =>
      recordMove({
        id: 1,
        direction: "in",
        box: "MSCU1000007",
