import { describe, expect, it } from "vitest";
import { CanonicalStore } from "./canonical";

describe("canonical store", () => {
  it("keeps calls, windows, and dockets under one generation counter", () => {
    const store = new CanonicalStore();
