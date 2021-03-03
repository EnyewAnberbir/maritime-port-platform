import type { CallRow } from "../types/call";

export type SearchHit = {
  id: number;
  score: number;
  field: "reference" | "vessel" | "berth" | "box";
};
