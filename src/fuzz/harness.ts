import { PortDesk, type Command } from "../engine/runtime";
import { exportMppk } from "../export/mppkManifest";
import { replay } from "../journal/replay";

export type FuzzSeed = {
  name: string;
  commands: Command[];
};

export function runSeed(seed: FuzzSeed): PortDesk {
  const desk = new PortDesk();
  for (const command of seed.commands) {
