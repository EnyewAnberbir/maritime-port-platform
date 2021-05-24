import { replay } from "../journal/replay";
import type { JournalEvent } from "../journal/log";
import { CanonicalStore, type StoreSnapshot } from "../store/canonical";

export type Checkpoint = {
  snapshot: StoreSnapshot;
  journalSeq: number;
};

