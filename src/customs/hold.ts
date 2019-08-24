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

