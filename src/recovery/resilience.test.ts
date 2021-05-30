import { describe, expect, it } from "vitest";
import { PortDesk } from "../engine/runtime";

describe("checkpoint resilience", () => {
  it("recovers extra journal events after a checkpoint", () => {
    const desk = new PortDesk();
    desk.dispatch({
      type: "announce",
      name: "Metro Tide",
      imo: "9311488",
      eta: "2015-03-12T04:15:00.000Z",
      draftDm: 121,
    });
    desk.dispatch({ type: "assignBerth", callId: 1, berthId: "Q-3", startMin: 90, endMin: 480 });
    const checkpoint = desk.checkpoint();
    const extra = [
      {
        seq: desk.journal.lastSeq() + 1,
        kind: "file-docket" as const,
