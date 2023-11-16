import { describe, expect, it } from "vitest";
import { assertExportStable, assertReplayDeterministic, type FuzzSeed } from "./harness";

const seedModules = import.meta.glob("./seeds/*.json", { eager: true, import: "default" });

function loadSeeds(): FuzzSeed[] {
  return Object.keys(seedModules)
    .sort()
    .map((key) => seedModules[key] as FuzzSeed);
}

describe("fuzz harness", () => {
  const seeds = loadSeeds();

  it("has at least 24 varied seeds", () => {
    expect(seeds.length).toBeGreaterThanOrEqual(24);
    const names = new Set(seeds.map((seed) => seed.name));
    expect(names.size).toBe(seeds.length);
  });

  it("replays deterministically and keeps export stable after rebuild", () => {
    for (const seed of seeds) {
      assertReplayDeterministic(seed);
      assertExportStable(seed);
    }
  });
});
