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
    desk.dispatch(command);
  }
  return desk;
}

export function assertReplayDeterministic(seed: FuzzSeed): void {
  const desk = runSeed(seed);
  const events = desk.journal.all();
  const first = replay(events);
  const second = replay(events);
  if (JSON.stringify(first.snapshot()) !== JSON.stringify(second.snapshot())) {
    throw new Error(`${seed.name}: replay is not deterministic`);
  }
  if (first.generation !== desk.store.generation) {
    throw new Error(`${seed.name}: replay generation drifted`);
  }
}

export function assertExportStable(seed: FuzzSeed): void {
  const desk = runSeed(seed);
