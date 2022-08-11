import { useEffect, useState } from "react";
import type { CallRow, CallState } from "../types/call";

export type CallFilter = {
  query: string;
  state: CallState | "all";
  flaggedOnly: boolean;
};

export function filterLatencyMs(query: string): number {
  return 40 + query.length * 30;
}

