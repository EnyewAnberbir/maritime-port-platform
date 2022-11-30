import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type DeskView = "calls" | "berths" | "cargo" | "customs" | "yard" | "export";

type FocusValue = {
  view: DeskView;
  setView: (view: DeskView) => void;
  focusedId: number | null;
  setFocusedId: (id: number | null) => void;
};

const FocusContext = createContext<FocusValue | null>(null);

export function FocusProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<DeskView>("calls");
  const [focusedId, setFocusedId] = useState<number | null>(null);
  const value = useMemo(
    () => ({ view, setView, focusedId, setFocusedId }),
    [view, focusedId],
  );
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

