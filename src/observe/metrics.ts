export type PortMetrics = {
  callCount: number;
  openHoldCount: number;
  yardUsed: number;
  projectionLag: number;
  journalLength: number;
  compactPasses: number;
  exportBytes: number;
};

export class Metrics {
  private values: PortMetrics = {
    callCount: 0,
    openHoldCount: 0,
    yardUsed: 0,
