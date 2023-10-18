import type { YardSlot } from "../yard/stack";

export type CompactJob = {
  id: string;
  stage: "pending" | "done";
  inputHash: string;
  kept: number;
  dropped: number;
  slots: YardSlot[];
