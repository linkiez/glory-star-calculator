import { CUTTING_SPEEDS } from './cuttingSpeeds';
import { interpolateParameter } from './interpolateParameter';

/** Returns the reference cutting feed in mm/min, not a material-specific machine recipe. */
export function getCuttingSpeed(thickness: number): number {
  return interpolateParameter(CUTTING_SPEEDS, thickness);
}
