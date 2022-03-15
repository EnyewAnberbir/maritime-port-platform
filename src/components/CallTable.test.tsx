import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CallRow } from "../types/call";
import { CallTable } from "./CallTable";
