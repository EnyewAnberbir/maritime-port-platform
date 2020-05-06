import { describe, expect, it } from "vitest";
import { encode, Op } from "./codec";
import { validateEnvelope, validateMagic } from "./validate";

describe("MPPK validate", () => {
