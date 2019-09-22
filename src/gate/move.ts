export type GateDirection = "in" | "out";

export type GateMove = {
  id: number;
  direction: GateDirection;
  box: string;
  chassis: string;
  callId: number;
  movedOn: string;
