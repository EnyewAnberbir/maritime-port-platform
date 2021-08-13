import { describe, expect, it } from "vitest";
import { exportMppk } from "../export/mppkManifest";
import { projectPort } from "../projection/portView";
import { PortDesk } from "./runtime";

describe("announce -> berth -> cargo -> journal -> projection -> export", () => {
  it("walks the live harbor pipeline", () => {
    const desk = new PortDesk();
    desk.dispatch({
      type: "announce",
      name: "Harbor Star",
      imo: "9321483",
      eta: "2015-03-11T06:00:00.000Z",
      draftDm: 112,
    });
    desk.dispatch({ type: "assignBerth", callId: 1, berthId: "B-12", startMin: 60, endMin: 420 });
    desk.dispatch({
      type: "fileDocket",
      callId: 1,
      box: "MSCU1000007",
      isoSize: "40",
      vgmKg: 18200,
      tareKg: 3780,
      laden: true,
    });
