import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { seedPortDesk } from "../data/seedPort";
import type { PortDesk } from "../engine/runtime";

type PortValue = {
  desk: PortDesk;
  revision: number;
  bump: () => void;
};

const PortContext = createContext<PortValue | null>(null);

