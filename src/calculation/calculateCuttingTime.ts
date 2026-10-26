import { calculateDistance } from '../geometry/calculateDistance';
import { GEOMETRY_TOLERANCE } from '../geometry/geometryTolerance';
import type { CuttingTimeOptions, CuttingTimeResult, Movement, Point } from '../models/index';
import { createMovementTimeCalculator } from './createMovementTimeCalculator';
import { optimizeMovements } from './optimizeMovements';
import { resolveCuttingParameters } from './resolveCuttingParameters';

/**
 * Estimates cutting, travel, piercing and one job setup, in seconds.
 * @param movements - Ordered millimetre toolpath; gaps imply laser-off travel.
 * @param options - Recipe feeds, piercing duration and optional machine acceleration.
 * @returns Additive time and distance breakdown. partCount retains the legacy contour-count meaning.
 * @throws Error for non-finite geometry or invalid process parameters.
 */
export function calculateCuttingTime(movements: Movement[], options: CuttingTimeOptions): CuttingTimeResult {
  const { scale, feed, pierceTime, rapid, setup, leadLength, acceleration, referenceMotion } = resolveCuttingParameters(options);
  const movementTime = createMovementTimeCalculator(acceleration, referenceMotion);
  const result: CuttingTimeResult = {
    totalTimeSec: 0, cuttingTimeSec: 0, movementTimeSec: 0, piercingTimeSec: 0,
    setupTimeSec: 0, totalDistance: 0, cuttingDistance: 0, movementDistance: 0,
    pierceCount: 0, partCount: 0
  };
  const scaled = movements.map(movement => {
    const mapped = {
      ...movement,
      start: { x: movement.start.x * scale, y: movement.start.y * scale },
      end: { x: movement.end.x * scale, y: movement.end.y * scale }
    };
    calculateDistance(mapped.start, mapped.end);
    if (typeof mapped.isCutting !== 'boolean') throw new Error('Estado de corte inválido');
    return mapped;
  });
  const processed = options.optimize ? optimizeMovements(scaled) : scaled;
  let position: Point | undefined;
  let contourDistance = 0;
  function finishContour(): void {
    if (contourDistance === 0) return;
    const distance = contourDistance + leadLength;
    result.cuttingDistance += distance;
    result.cuttingTimeSec += movementTime(distance, feed);
    result.pierceCount++;
    contourDistance = 0;
  }
  function travel(distance: number): void {
    result.movementDistance += distance;
    result.movementTimeSec += movementTime(distance, rapid);
  }
  for (const movement of processed) {
    const gap = position ? calculateDistance(position, movement.start) : 0;
    if (gap > GEOMETRY_TOLERANCE || !movement.isCutting || movement.startsContour) finishContour();
    if (gap > GEOMETRY_TOLERANCE) travel(gap);
    const distance = calculateDistance(movement.start, movement.end);
    if (movement.isCutting) contourDistance += distance;
    else travel(distance);
    position = movement.end;
  }
  finishContour();
  result.partCount = result.pierceCount;
  result.piercingTimeSec = result.pierceCount * pierceTime;
  result.setupTimeSec = result.pierceCount > 0 ? setup : 0;
  result.totalDistance = result.cuttingDistance + result.movementDistance;
  result.totalTimeSec = result.cuttingTimeSec + result.movementTimeSec + result.piercingTimeSec + result.setupTimeSec;
  if (!Object.values(result).every(Number.isFinite)) throw new Error('Resultado fora do intervalo numérico');
  return result;
}
