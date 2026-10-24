/** Process parameters with lengths in mm, feeds in mm/min and durations in seconds. */
export interface CuttingTimeOptions {
  materialThickness: number;
  kerf?: number;
  leadIn?: number;
  leadOut?: number;
  piercingType?: 'normal' | 'flying';
  optimize?: boolean;
  /** Geometric scale only; never use this to fit measured cycle times. */
  scaleFactor?: number;
  cuttingSpeed?: number;
  /** Full piercing cycle per contour, including all active stages. */
  pierceTime?: number;
  rapidSpeed?: number;
  /** Acceleration in mm/s²; omitted uses the reference contour overhead. */
  accelerationMmPerSec2?: number;
  /** One setup per job; zero excludes setup from the cycle. */
  setupTimeSec?: number;
}
