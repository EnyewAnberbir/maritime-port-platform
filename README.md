# Maritime Port Platform Desk

Offline operations console for **Maritime Port Platform** — a berth, vessel-call,
yard, cargo-control, and MPPK export engine.

Harbor controllers announce vessel calls, hold berth windows without overlap,
file cargo dockets with ISO boxes and SOLAS VGM, place customs holds, stack
yard blocks under RTG cranes, log gate in/out on chassis, and emit an
append-only `MPPK` package. The desk never talks to a network: the canonical
store, journal, projection, search index, reconcile, checkpoint, and export
layers all run in the browser process.

This is a TypeScript port of the Zig `maritime-port-platform` product: the
`MPPK` wire envelope, `buildSession` marks, berth metric fold, and the
command → validate → store → journal → projection pipeline. Clone-shaped
projection folders from the Zig tree are not reproduced.

## Layers

Command/UI → validate/policy → canonical store → append-only journal →
derived projection + search index → reconcile → recovery/checkpoint →
MPPK export/audit → observability.

## MPPK wire format

Magic `MPPK` (`0x4D 0x50 0x50 0x4B`), then version `u16` LE, flags `u16` LE,
record count `u16` LE. Each record is `op u8`, three reserved bytes (Zig
`parseEnvelope` alignment), `key u32` LE, `aux u32` LE, `payload_len u16` LE,
then payload.

| Op | Code |
| --- | --- |
| none | 0 |
| vessel | 1 |
| berth | 2 |
| cargo | 3 |
| customs | 4 |
| seal | 5 |
| recover | 6 |
| compact | 7 |
| extend | 8 |
| query | 9 |
| export_op | 10 |

## Scripts

Requires Node 20 (`engines.node` is `>=20`).

```bash
npm install
npm run dev
npm test
