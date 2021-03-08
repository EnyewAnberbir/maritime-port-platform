import type { CallRow } from "../types/call";

export type SearchHit = {
  id: number;
  score: number;
  field: "reference" | "vessel" | "berth" | "box";
};

export class CallSearchIndex {
  private rows: CallRow[] = [];
  private boxes = new Map<number, string[]>();

  rebuild(rows: CallRow[], boxByCall: Map<number, string[]> = new Map()): void {
    this.rows = rows.map((row) => ({ ...row }));
    this.boxes = new Map([...boxByCall.entries()].map(([id, list]) => [id, [...list]]));
  }

  search(query: string): SearchHit[] {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return this.rows.map((row) => ({ id: row.id, score: 1, field: "reference" as const }));
    }
    const hits: SearchHit[] = [];
    for (const row of this.rows) {
      const fields: Array<Exclude<SearchHit["field"], "box">> = ["reference", "vessel", "berth"];
      let matched: SearchHit | null = null;
      for (const field of fields) {
