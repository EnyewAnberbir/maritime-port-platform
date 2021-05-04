import { describe, expect, it } from "vitest";
import { PortDesk } from "../engine/runtime";
import { recover, takeCheckpoint } from "./checkpoint";

describe("recovery replay", () => {
  it("restores a snapshot and replays the journal tail", () => {
    const desk = new PortDesk();
    desk.dispatch({
      type: "announce",
      name: "Harbor Star",
      imo: "9321483",
      eta: "2015-03-11T06:00:00.000Z",
      draftDm: 112,
