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
        const value = row[field].toLowerCase();
        if (value.includes(needle)) {
          const score = value === needle ? 4 : value.startsWith(needle) ? 3 : 1;
          matched = { id: row.id, score, field };
          break;
        }
      }
      if (!matched) {
        const boxes = this.boxes.get(row.id) ?? [];
        if (boxes.some((box) => box.toLowerCase().includes(needle))) {
          matched = { id: row.id, score: 2, field: "box" };
        }
      }
      if (matched) {
        hits.push(matched);
      }
    }
    return hits.sort((a, b) => b.score - a.score || a.id - b.id);
  }

  lookup(query: string): CallRow[] {
    const ids = new Set(this.search(query).map((hit) => hit.id));
    return this.rows.filter((row) => ids.has(row.id));
  }
}
