import { describe, expect, it } from "vitest";
import { assertExportStable, assertReplayDeterministic, type FuzzSeed } from "./harness";

const seedModules = import.meta.glob("./seeds/*.json", { eager: true, import: "default" });

function loadSeeds(): FuzzSeed[] {
  return Object.keys(seedModules)
    .sort()
