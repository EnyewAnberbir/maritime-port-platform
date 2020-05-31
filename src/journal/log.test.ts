import { describe, expect, it } from "vitest";
import { Journal } from "./log";

describe("journal log", () => {
  it("assigns rising sequence numbers and clones on read", () => {
    const journal = new Journal();
    const first = journal.append({
      kind: "announce",
      callId: 1,
