import { describe, expect, it } from "vitest";
import { encodeUtf8 } from "../lib/bytes";
import { encode, Op } from "../wire/codec";
import { processMppkBytes } from "./workflow";

describe("MPPK workflow", () => {
