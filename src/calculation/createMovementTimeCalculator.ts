import { ACCELERATION_TIME } from '../technology/reference/accelerationTime';
import { MIN_DISTANCE_FOR_ACCELERATION } from '../technology/reference/minDistanceForAcceleration';

/** A motion-time Strategy receiving distance in mm and feed in mm/min, returning seconds. */
type MovementTimeCalculator = (distance: number, feed: number) => number;

/**
 * Selects a motion-time Strategy once per job rather than branching for every movement.
 * @param acceleration - Optional calibrated acceleration in mm/s².
 * @returns Reference-overhead or triangular/trapezoidal time calculator.
 */
export function createMovementTimeCalculator(acceleration?: number): MovementTimeCalculator {
  if (acceleration === undefined) {
    return (distance, feed) => {
      if (distance === 0) return 0;
      return distance / (feed / 60) +
        (distance >= MIN_DISTANCE_FOR_ACCELERATION ? ACCELERATION_TIME : 0);
    };
  }
  return (distance, feed) => {
    if (distance === 0) return 0;
    const speed = feed / 60;
    const rampDistance = speed * speed / acceleration;
    return distance <= rampDistance
      ? 2 * Math.sqrt(distance / acceleration)
      : distance / speed + speed / acceleration;
  };
}
