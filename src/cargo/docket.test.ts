import { describe, expect, it } from "vitest";
import { assertVgm, fileDocket, vgmAcceptable } from "./docket";

describe("cargo VGM", () => {
  it("accepts a laden SOLAS VGM above tare", () => {
    const docket = fileDocket({
      id: 1,
      callId: 1,
      box: "MSCU1000007",
