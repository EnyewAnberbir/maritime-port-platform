import { encodeUtf8 } from "../lib/bytes";
import type { CanonicalStore } from "../store/canonical";
import { encode, envelopeChecksum, Op, type MppkEnvelope, type MppkRecord } from "../wire/codec";

export type MppkManifest = {
  bytes: Uint8Array;
  envelope: MppkEnvelope;
  storeGeneration: number;
  callCount: number;
  recordCount: number;
};

export function exportMppk(store: CanonicalStore): MppkManifest {
  const generationBefore = store.generation;
  const calls = store.all();
  const windows = store.windows.all();
  const dockets = store.dockets.all();
  const holds = store.customs.open();
