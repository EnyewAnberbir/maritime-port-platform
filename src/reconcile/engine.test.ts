import { describe, expect, it } from "vitest";
import { PortDesk } from "../engine/runtime";
import { projectPort } from "../projection/portView";
import { reconcile } from "./engine";

describe("reconcile converge", () => {
  it("matches a fresh view and rebuilds a drifted one", () => {
    const desk = new PortDesk();
    desk.dispatch({
      type: "announce",
      name: "Cedar Wave",
      imo: "9166778",
      eta: "2015-03-11T09:30:00.000Z",
      draftDm: 98,
    });
    const fresh = projectPort(desk.store);
    expect(reconcile(desk.store, fresh).report.matched).toBe(true);
    const drifted = { ...fresh, callCount: 0, storeGeneration: 0 };
    const rebuilt = reconcile(desk.store, drifted);
    expect(rebuilt.report.matched).toBe(false);
    expect(rebuilt.report.rebuilt).toBe(true);
    expect(rebuilt.view.callCount).toBe(1);
