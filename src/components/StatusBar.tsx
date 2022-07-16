import type { PortMetrics } from "../observe/metrics";

export function StatusBar({ metrics }: { metrics: PortMetrics }) {
  return (
    <footer className="status-bar">
      <span>calls {metrics.callCount}</span>
