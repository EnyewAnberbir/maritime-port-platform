import { describe, expect, it } from "vitest";
import { PortDesk } from "../engine/runtime";
import { MPPK_MAGIC } from "../wire/codec";
import { exportMppk } from "./mppkManifest";

describe("export does not mutate", () => {
  it("emits MPPK bytes without bumping store generation", () => {
    const desk = new PortDesk();
    desk.dispatch({
      type: "announce",
      name: "Oak Current",
      imo: "9108128",
      eta: "2015-03-12T14:00:00.000Z",
      draftDm: 105,
    });
    const before = structuredClone(desk.store.snapshot());
    const manifest = exportMppk(desk.store);
    expect(desk.store.generation).toBe(before.generation);
    expect(desk.store.snapshot()).toEqual(before);
    expect(Array.from(manifest.bytes.slice(0, 4))).toEqual(Array.from(MPPK_MAGIC));
    expect(manifest.callCount).toBe(1);
  });
