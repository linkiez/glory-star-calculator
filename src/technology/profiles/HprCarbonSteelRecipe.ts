/**
 * Conventional carbon-steel O2/air recipe selected from the local Phoenix cut chart.
 * Feed is in mm/min, thickness and kerf in mm, and normal piercing delay in seconds.
 * The delay excludes unverified height-sensing, gas and other machine cycle overheads.
 */
export interface HprCarbonSteelRecipe {
  readonly thicknessMm: number;
  readonly currentA: number;
  readonly cuttingSpeedMmPerMin: number;
  readonly pierceTimeSec: number;
  readonly kerfMm: number;
  readonly sourceRow: number;
}
