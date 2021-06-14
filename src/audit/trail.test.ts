import { describe, expect, it } from "vitest";
import { AuditTrail } from "./trail";

describe("audit trail", () => {
  it("records export and recovery without sharing the live array", () => {
    const trail = new AuditTrail();
    trail.record("lifecycle", "announce", 1);
    trail.record("export", "mppk calls=1", 1);
    expect(trail.ofKind("export")).toHaveLength(1);
    const copy = trail.all()[0];
    if (copy) {
      copy.summary = "mutated";
    }
    expect(trail.all()[0]?.summary).toBe("announce");
  });
});
