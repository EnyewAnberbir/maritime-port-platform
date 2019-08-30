export type CustomsHold = {
  id: number;
  callId: number;
  box: string;
  reason: string;
  openedOn: string;
  releasedOn: string | null;
};

export function openHold(input: {
  id: number;
  callId: number;
  box: string;
  reason: string;
  openedOn: string;
}): CustomsHold {
  if (!input.reason.trim()) {
    throw new Error("customs hold needs a reason");
  }
  return {
    id: input.id,
    callId: input.callId,
    box: input.box,
    reason: input.reason.trim(),
    openedOn: input.openedOn,
    releasedOn: null,
  };
}

export function releaseHold(hold: CustomsHold, releasedOn: string): CustomsHold {
  if (hold.releasedOn) {
    throw new Error(`hold ${hold.id} already released`);
  }
  if (releasedOn < hold.openedOn) {
    throw new Error(`hold ${hold.id} cannot release before open`);
  }
  return { ...hold, releasedOn };
}

export class CustomsJournal {
  private readonly holds = new Map<number, CustomsHold>();
  private nextId = 1;

  peekNextId(): number {
    return this.nextId;
  }

  put(hold: CustomsHold): CustomsHold {
    const open = this.openForBox(hold.box);
    if (open && open.id !== hold.id) {
      throw new Error(`box ${hold.box} already under hold ${open.id}`);
    }
    this.holds.set(hold.id, { ...hold });
    this.nextId = Math.max(this.nextId, hold.id + 1);
    return this.require(hold.id);
  }

  get(id: number): CustomsHold | undefined {
    const hold = this.holds.get(id);
    return hold ? { ...hold } : undefined;
  }

  require(id: number): CustomsHold {
    const hold = this.get(id);
    if (!hold) {
      throw new Error(`customs hold ${id} is not on the journal`);
    }
    return hold;
  }

  openForBox(box: string): CustomsHold | undefined {
    return this.all().find((hold) => hold.box === box && hold.releasedOn === null);
  }

  isHeld(box: string): boolean {
    return Boolean(this.openForBox(box));
  }

  all(): CustomsHold[] {
    return [...this.holds.values()].map((hold) => ({ ...hold })).sort((a, b) => a.id - b.id);
  }

  open(): CustomsHold[] {
    return this.all().filter((hold) => hold.releasedOn === null);
  }

  hydrate(holds: CustomsHold[], nextId: number): void {
