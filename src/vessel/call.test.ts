import { describe, expect, it } from "vitest";
import { announceCall, assertImo, imoChecksumOk } from "./call";

describe("vessel calls", () => {
  it("accepts a legal announced call with a valid IMO", () => {
