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

  const records: MppkRecord[] = [];
  for (const call of calls) {
    records.push({
      op: Op.vessel,
      key: call.id,
      aux: call.draftDm,
      payload: encodeUtf8(`${call.reference}|${call.imo}|${call.name}|${call.state}`),
    });
  }
  for (const window of windows) {
    records.push({
      op: Op.berth,
      key: window.id,
      aux: window.callId,
      payload: encodeUtf8(`${window.berthId}|${window.startMin}|${window.endMin}|${window.state}`),
    });
  }
  for (const docket of dockets) {
    records.push({
      op: Op.cargo,
      key: docket.id,
      aux: docket.callId,
      payload: encodeUtf8(`${docket.box}|${docket.isoSize}|${docket.vgmKg}|${docket.state}`),
    });
  }
  for (const hold of holds) {
    records.push({
      op: Op.customs,
      key: hold.id,
      aux: hold.callId,
      payload: encodeUtf8(`${hold.box}|${hold.reason}`),
    });
  }
  records.push({
    op: Op.export_op,
    key: generationBefore,
    aux: calls.length,
    payload: encodeUtf8("maritime-port-platform"),
  });

  const draft = { version: 1, flags: 0, records };
  const bytes = encode(draft);
  if (store.generation !== generationBefore) {
    throw new Error("export mutated the canonical store");
  }
  return {
    bytes,
    envelope: { ...draft, checksum: envelopeChecksum(records) },
    storeGeneration: generationBefore,
    callCount: calls.length,
    recordCount: records.length,
  };
}
