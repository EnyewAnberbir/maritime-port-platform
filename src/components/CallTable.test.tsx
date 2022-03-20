import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CallRow } from "../types/call";
import { CallTable } from "./CallTable";

const row: CallRow = {
  id: 1,
  reference: "MP-0001",
  vessel: "Harbor Star",
  berth: "B-12",
  state: "working",
  risk: "medium",
  flagged: true,
  eta: "2015-03-11T06:00:00.000Z",
  boxes: 2,
};

describe("CallTable", () => {
  it("invokes Inspect for the row", async () => {
    const onInspect = vi.fn();
    render(
      <CallTable
        rows={[row]}
        selectedIndex={null}
