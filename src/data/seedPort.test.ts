import { describe, expect, it } from "vitest";
import { SEED_NAME, seedPortDesk } from "./seedPort";

describe("seed port", () => {
  it("loads sixteen deterministic vessel calls", () => {
    const desk = seedPortDesk();
    const rows = desk.rows();
    expect(SEED_NAME).toBe("maritime-port-platform");
    expect(rows).toHaveLength(16);
    expect(rows.map((row) => row.reference)).toEqual(
      Array.from({ length: 16 }, (_, index) => `MP-${String(index + 1).padStart(4, "0")}`),
    );
    expect(rows[0]?.vessel).toBe("Harbor Star");
    expect(rows[1]?.vessel).toBe("Cedar Wave");
    expect(rows[2]?.vessel).toBe("Metro Tide");
    expect(rows[3]?.vessel).toBe("Oak Current");
    expect(desk.store.windows.live().some((window) => window.berthId === "B-12")).toBe(true);
    expect(desk.store.windows.live().some((window) => window.berthId === "Q-3")).toBe(true);
    expect(desk.store.dockets.all().some((docket) => docket.box.startsWith("MSCU"))).toBe(true);
  });
});
