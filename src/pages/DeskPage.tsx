import { useMemo, useState } from "react";
import { BerthPanel } from "../components/BerthPanel";
import { CallTable } from "../components/CallTable";
import { CargoPanel } from "../components/CargoPanel";
import { CustomsPanel } from "../components/CustomsPanel";
import { DeskNav } from "../components/DeskNav";
import { EmptyState } from "../components/EmptyState";
import { FilterBar } from "../components/FilterBar";
import { Inspector } from "../components/Inspector";
import { MetricCard } from "../components/MetricCard";
import { Pager } from "../components/Pager";
import { useFocus } from "../context/FocusContext";
import { exportMppk } from "../export/mppkManifest";
import { useCallFilter, type CallFilter } from "../hooks/useCallFilter";
import { usePagination } from "../hooks/usePagination";
import { usePort } from "../hooks/usePort";
import { useRowSelection } from "../hooks/useRowSelection";
import type { CallRow, CallState } from "../types/call";

export function DeskPage() {
  const { desk, revision } = usePort();
  const { view, setView, focusedId, setFocusedId } = useFocus();
  const rows = useMemo(() => desk.rows(), [desk, revision]);
  const [filter, setFilter] = useState<CallFilter>({
    query: "",
    state: "all",
    flaggedOnly: false,
  });
  const indexed = useMemo(() => {
    if (!filter.query.trim()) {
      return rows;
    }
    return desk.index.lookup(filter.query);
  }, [desk, filter.query, rows]);
  const filtered = useCallFilter(indexed, filter);
  const paging = usePagination(filtered, 8);
  const selection = useRowSelection(paging.slice.length);
  const selectedRow =
