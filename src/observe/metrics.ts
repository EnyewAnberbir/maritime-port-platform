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
    projectionLag: 0,
    journalLength: 0,
    compactPasses: 0,
    exportBytes: 0,
  };

  snapshot(): PortMetrics {
    return { ...this.values };
  }

  record(partial: Partial<PortMetrics>): PortMetrics {
    this.values = { ...this.values, ...partial };
    return this.snapshot();
  }

  bumpCompact(): number {
    this.values.compactPasses += 1;
    return this.values.compactPasses;
  }

  setLag(storeGeneration: number, viewGeneration: number): number {
    this.values.projectionLag = Math.max(0, storeGeneration - viewGeneration);
    return this.values.projectionLag;
  }
}
