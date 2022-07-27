import type { PortMetrics } from "../observe/metrics";

export function StatusBar({ metrics }: { metrics: PortMetrics }) {
  return (
    <footer className="status-bar">
      <span>calls {metrics.callCount}</span>
      <span>holds {metrics.openHoldCount}</span>
      <span>yard {metrics.yardUsed}</span>
      <span className={metrics.projectionLag > 0 ? "severity-high" : "severity-low"} />
      <span>journal {metrics.journalLength}</span>
      <span>compacts {metrics.compactPasses}</span>
    </footer>
  );
}
