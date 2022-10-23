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
    selection.selectedIndex === null ? null : paging.slice[selection.selectedIndex] ?? null;
  const inspected = rows.find((row) => row.id === focusedId) ?? selectedRow;

  const inspect = (row: CallRow) => {
    setFocusedId(row.id);
  };

  return (
    <div className="desk">
      <DeskNav view={view} onChange={setView} />
      <main className="desk-main">
        <div className="metric-grid">
          <MetricCard label="Calls" value={desk.view.callCount} />
          <MetricCard label="Alongside" value={desk.view.alongsideCount} />
          <MetricCard label="Holds" value={desk.view.openHoldCount} />
          <MetricCard label="Yard" value={`${desk.view.yardUsed}/${desk.view.yardCapacity}`} />
        </div>
        {view === "calls" ? (
          <>
            <FilterBar
              query={filter.query}
              state={filter.state}
              flaggedOnly={filter.flaggedOnly}
              onQuery={(query) => setFilter((current) => ({ ...current, query }))}
              onState={(state: CallState | "all") =>
                setFilter((current) => ({ ...current, state }))
              }
              onFlaggedOnly={(flaggedOnly) =>
                setFilter((current) => ({ ...current, flaggedOnly }))
              }
            />
            {paging.slice.length === 0 ? (
              <EmptyState
                title="No calls in this cut"
                detail="Relax the query, state, or flagged filter."
              />
            ) : (
              <CallTable
                rows={paging.slice}
                selectedIndex={selection.selectedIndex}
                onSelectIndex={selection.select}
                onInspect={inspect}
              />
            )}
            <Pager
              page={paging.page}
              pageCount={paging.pageCount}
              onPrev={paging.prev}
              onNext={paging.next}
            />
          </>
        ) : null}
        {view === "berths" ? <BerthPanel windows={desk.store.windows.all()} /> : null}
        {view === "cargo" ? <CargoPanel dockets={desk.store.dockets.all()} /> : null}
        {view === "customs" ? <CustomsPanel holds={desk.store.customs.all()} /> : null}
        {view === "yard" ? <YardView desk={desk} /> : null}
        {view === "export" ? <ExportPreview desk={desk} /> : null}
      </main>
      <div className="side-stack">
