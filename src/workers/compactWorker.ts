import type { YardSlot } from "../yard/stack";

export type CompactJob = {
  id: string;
  stage: "pending" | "done";
  inputHash: string;
  kept: number;
  dropped: number;
  slots: YardSlot[];
};

export function hashSlots(slots: YardSlot[]): string {
  return slots
    .map((slot) => `${slot.block}:${slot.bay}/${slot.row}/${slot.tier}:${slot.box ?? "-"}:${slot.abandoned ? 1 : 0}`)
    .join("|");
}

/** Idempotent: compacting an already-compacted yard is a no-op. */
export function runCompactJob(job: CompactJob, slots: YardSlot[]): CompactJob {
  const inputHash = hashSlots(slots);
  if (job.stage === "done" && (job.inputHash === inputHash || inputHash === hashSlots(job.slots))) {
    return {
      ...job,
      dropped: 0,
      slots: job.slots.map((slot) => ({ ...slot })),
    };
  }
  const live = slots.filter((slot) => slot.box || !slot.abandoned);
  const dropped = slots.length - live.length;
  return {
    id: job.id,
    stage: "done",
    inputHash,
    kept: live.length,
    dropped,
    slots: live.map((slot) => ({ ...slot, abandoned: false })),
  };
}
