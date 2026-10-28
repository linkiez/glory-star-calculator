/** Optional overrides for the provisional Talvi HSTool unit and piercing assumptions. */
export interface TalviTechnologySelection {
  /** Omission infers mm/s, explicitly reported in the returned assumptions. */
  speedUnit?: 'mm/s' | 'mm/min';
  /** Omission infers ms for the stage sum, explicitly reported in the returned assumptions. */
  timeUnit?: 'ms' | 's';
  /** Measured full per-contour cycle in seconds; required if the recipe has no enabled stages. */
  pierceTimeSec?: number;
}
