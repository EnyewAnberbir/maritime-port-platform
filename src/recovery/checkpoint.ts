import { replay } from "../journal/replay";
import type { JournalEvent } from "../journal/log";
import { CanonicalStore, type StoreSnapshot } from "../store/canonical";

export type Checkpoint = {
  snapshot: StoreSnapshot;
  journalSeq: number;
};

export function takeCheckpoint(store: CanonicalStore, journalSeq: number): Checkpoint {
  return {
    snapshot: structuredClone(store.snapshot()),
    journalSeq,
  };
}

export function recover(checkpoint: Checkpoint, tail: JournalEvent[]): CanonicalStore {
  const store = new CanonicalStore();
  store.hydrate(structuredClone(checkpoint.snapshot));
  const extras = tail
    .filter((event) => event.seq > checkpoint.journalSeq)
    .sort((a, b) => a.seq - b.seq);
  replay(extras, store);
  return store;
}

export function recoverFromEvents(events: JournalEvent[]): CanonicalStore {
  return replay(events, new CanonicalStore());
}
