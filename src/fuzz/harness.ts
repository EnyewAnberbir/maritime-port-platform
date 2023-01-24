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
  const rebuilt = replay(desk.journal.all());
  const live = exportMppk(desk.store);
  const after = exportMppk(rebuilt);
  if (live.bytes.length !== after.bytes.length) {
    throw new Error(`${seed.name}: export length changed after rebuild`);
  }
  for (let i = 0; i < live.bytes.length; i += 1) {
    if (live.bytes[i] !== after.bytes[i]) {
      throw new Error(`${seed.name}: export bytes changed after rebuild`);
    }
  }
  if (desk.store.generation !== rebuilt.generation) {
    throw new Error(`${seed.name}: store generation drifted during export compare`);
  }
}
