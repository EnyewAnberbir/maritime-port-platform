import { describe, expect, it } from "vitest";
import { SEED_NAME, seedPortDesk } from "./seedPort";

describe("seed port", () => {
  it("loads sixteen deterministic vessel calls", () => {
    const desk = seedPortDesk();
    const rows = desk.rows();
    expect(SEED_NAME).toBe("maritime-port-platform");
    expect(rows).toHaveLength(16);
    expect(rows.map((row) => row.reference)).toEqual(
