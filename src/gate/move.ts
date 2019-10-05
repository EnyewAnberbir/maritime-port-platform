export type GateDirection = "in" | "out";

export type GateMove = {
  id: number;
  direction: GateDirection;
  box: string;
  chassis: string;
  callId: number;
  movedOn: string;
};

const CHASSIS = /^[A-Z]{2}[0-9]{6}$/;

export function assertChassis(chassis: string): void {
  if (!CHASSIS.test(chassis)) {
    throw new Error(`chassis ${chassis} is not a terminal plate`);
  }
}

export function recordMove(input: {
  id: number;
  direction: GateDirection;
  box: string;
  chassis: string;
  callId: number;
  movedOn: string;
}): GateMove {
  assertChassis(input.chassis);
  if (!input.box) {
    throw new Error("gate move needs a box");
  }
  return { ...input };
}

export class GateLog {
  private readonly moves: GateMove[] = [];
  private nextId = 1;

  peekNextId(): number {
    return this.nextId;
  }

  append(move: GateMove): GateMove {
    const last = this.lastForBox(move.box);
    if (move.direction === "in" && last?.direction === "in") {
      throw new Error(`box ${move.box} is already gated in`);
    }
    if (move.direction === "out" && last?.direction !== "in") {
      throw new Error(`box ${move.box} cannot gate out before gate in`);
