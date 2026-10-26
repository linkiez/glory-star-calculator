import type { MachineProfile } from '../technology/profiles/MachineProfile';

/** A motion-time Strategy receiving distance in mm and feed in mm/min, returning seconds. */
type MovementTimeCalculator = (distance: number, feed: number) => number;

/**
 * Selects a motion-time Strategy once per job rather than branching for every movement.
 * @param acceleration - Optional calibrated acceleration in mm/s².
 * @param referenceMotion - Overhead belonging only to the selected machine.
 * @returns Reference-overhead or triangular/trapezoidal time calculator.
 */
export function createMovementTimeCalculator(
  acceleration: number | undefined, referenceMotion: MachineProfile['referenceMotion']
): MovementTimeCalculator {
  if (acceleration === undefined) {
    if (!referenceMotion) throw new Error('Informe a aceleração ou o modelo de movimento da máquina');
    return (distance, feed) => {
      if (distance === 0) return 0;
      return distance / (feed / 60) +
        (distance >= referenceMotion.minDistanceMm ? referenceMotion.accelerationTimeSec : 0);
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
