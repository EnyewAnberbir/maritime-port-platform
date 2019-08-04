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
