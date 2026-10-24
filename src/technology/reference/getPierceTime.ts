import { PIERCE_TIMES } from './pierceTimes';
import { interpolateParameter } from './interpolateParameter';

/** Returns the reference piercing duration in seconds. */
export function getPierceTime(thickness: number): number {
  return interpolateParameter(PIERCE_TIMES, thickness);
}
