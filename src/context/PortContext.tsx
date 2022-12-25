import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { seedPortDesk } from "../data/seedPort";
import type { PortDesk } from "../engine/runtime";

type PortValue = {
  desk: PortDesk;
  revision: number;
  bump: () => void;
};

const PortContext = createContext<PortValue | null>(null);

export function PortProvider({ children }: { children: ReactNode }) {
  const desk = useMemo(() => seedPortDesk(), []);
  const [revision, setRevision] = useState(0);
  const value = useMemo(
    () => ({
      desk,
      revision,
      bump: () => setRevision((current) => current + 1),
    }),
    [desk, revision],
  );
  return <PortContext.Provider value={value}>{children}</PortContext.Provider>;
}

export function usePortContext(): PortValue {
  const value = useContext(PortContext);
  if (!value) {
    throw new Error("usePortContext must be used inside PortProvider");
  }
  return value;
}
