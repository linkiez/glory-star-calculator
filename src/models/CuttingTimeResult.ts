/** Additive time and distance breakdown for one job, in seconds and mm. */
export interface CuttingTimeResult {
  totalTimeSec: number;
  cuttingTimeSec: number;
  movementTimeSec: number;
  piercingTimeSec: number;
  setupTimeSec: number;
  totalDistance: number;
  cuttingDistance: number;
  movementDistance: number;
  pierceCount: number;
  /** Legacy contour count; does not identify physical parts. */
  partCount: number;
  cutAreaWidth?: number;
  cutAreaHeight?: number;
}
