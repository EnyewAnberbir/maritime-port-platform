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
  }
  if (slot.tier < 1 || slot.tier > block.tiers) {
    throw new Error(`tier ${slot.tier} outside ${block.id}`);
  }
}

export class YardMap {
  private readonly blocks = new Map<string, RtgBlock>();
  private readonly slots = new Map<string, YardSlot>();

  constructor(blocks: RtgBlock[] = DEFAULT_BLOCKS) {
    for (const block of blocks) {
      this.blocks.set(block.id, { ...block });
    }
  }

  block(id: string): RtgBlock {
    const found = this.blocks.get(id);
    if (!found) {
      throw new Error(`RTG block ${id} is not on the yard`);
    }
    return { ...found };
  }

  place(box: string, blockId: string, bay: number, row: number, tier: number): YardSlot {
    const block = this.block(blockId);
    assertSlotInBlock(block, { bay, row, tier });
    const existing = this.findBox(box);
    if (existing) {
      throw new Error(`box ${box} already stacked at ${slotKey(existing)}`);
    }
    const key = slotKey({ block: blockId, bay, row, tier });
    const occupant = this.slots.get(key);
    if (occupant?.box) {
      throw new Error(`slot ${key} occupied by ${occupant.box}`);
    }
    const slot: YardSlot = { block: blockId, bay, row, tier, box, abandoned: false };
    this.slots.set(key, slot);
    return { ...slot };
  }

  lift(box: string): YardSlot {
    const slot = this.findBox(box);
    if (!slot) {
      throw new Error(`box ${box} is not stacked`);
    }
    const key = slotKey(slot);
    const vacated: YardSlot = { ...slot, box: null, abandoned: true };
    this.slots.set(key, vacated);
    return { ...vacated };
  }

  findBox(box: string): YardSlot | undefined {
    return this.all().find((slot) => slot.box === box);
  }

  occupancy(): { used: number; capacity: number } {
    let capacity = 0;
    for (const block of this.blocks.values()) {
      capacity += block.bays * block.rows * block.tiers;
    }
    const used = this.all().filter((slot) => slot.box).length;
    return { used, capacity };
  }

  all(): YardSlot[] {
    return [...this.slots.values()]
      .map((slot) => ({ ...slot }))
      .sort((a, b) => slotKey(a).localeCompare(slotKey(b)));
  }

  occupied(): YardSlot[] {
    return this.all().filter((slot) => slot.box);
  }

  /** Drop abandoned empty slots. Occupied slots stay put. */
  compact(): { kept: YardSlot[]; dropped: number } {
    const kept: YardSlot[] = [];
    let dropped = 0;
    for (const slot of this.all()) {
