import { describe, expect, it } from "vitest";
import { PortDesk } from "../engine/runtime";
import { projectPort } from "./portView";

describe("port view", () => {
  it("derives alongside, hold, and yard occupancy from the store", () => {
    const desk = new PortDesk();
    desk.dispatch({
      type: "announce",
      name: "Harbor Star",
      imo: "9321483",
      eta: "2015-03-11T06:00:00.000Z",
      draftDm: 112,
    });
