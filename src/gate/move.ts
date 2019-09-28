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
