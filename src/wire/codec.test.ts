import { describe, expect, it } from "vitest";
import { decode, encode, envelopeChecksum, Op } from "./codec";

describe("MPPK codec roundtrip", () => {
  it("encodes and decodes vessel/berth/cargo records", () => {
