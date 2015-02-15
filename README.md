# Maritime Port Platform Desk

Offline operations console for **Maritime Port Platform** — a berth, vessel-call,
yard, cargo-control, and MPPK export engine.

Harbor controllers announce vessel calls, hold berth windows without overlap,
file cargo dockets with ISO boxes and SOLAS VGM, place customs holds, stack
yard blocks under RTG cranes, log gate in/out on chassis, and emit an
append-only `MPPK` package. The desk never talks to a network: the canonical
store, journal, projection, search index, reconcile, checkpoint, and export
layers all run in the browser process.

