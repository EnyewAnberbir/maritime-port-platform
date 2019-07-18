import { describe, expect, it } from "vitest";
import { CustomsJournal, openHold, releaseHold } from "./hold";

describe("customs hold/release", () => {
  it("opens a hold and releases it once", () => {
    const journal = new CustomsJournal();
    const hold = journal.put(
      openHold({
        id: 1,
