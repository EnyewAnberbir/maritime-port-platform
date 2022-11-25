import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type DeskView = "calls" | "berths" | "cargo" | "customs" | "yard" | "export";
