export type YardSlot = {
  block: string;
  bay: number;
  row: number;
  tier: number;
  box: string | null;
  abandoned: boolean;
};

export type RtgBlock = {
  id: string;
  bays: number;
  rows: number;
  tiers: number;
};

export const DEFAULT_BLOCKS: RtgBlock[] = [
  { id: "RTG-A", bays: 8, rows: 6, tiers: 5 },
  { id: "RTG-B", bays: 6, rows: 5, tiers: 4 },
];

function slotKey(slot: Pick<YardSlot, "block" | "bay" | "row" | "tier">): string {
  return `${slot.block}:${slot.bay}/${slot.row}/${slot.tier}`;
}

export function assertSlotInBlock(block: RtgBlock, slot: Pick<YardSlot, "bay" | "row" | "tier">): void {
  if (slot.bay < 1 || slot.bay > block.bays) {
    throw new Error(`bay ${slot.bay} outside ${block.id}`);
  }
  if (slot.row < 1 || slot.row > block.rows) {
    throw new Error(`row ${slot.row} outside ${block.id}`);
