import type { Point } from './Point';

/** A cutting or positioning segment with an optional explicit laser restart. */
export interface Movement {
  start: Point;
  end: Point;
  isCutting: boolean;
  /** Starts a new contour even if adjacent endpoints coincide. */
  startsContour?: boolean;
}
