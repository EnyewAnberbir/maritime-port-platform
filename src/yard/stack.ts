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
