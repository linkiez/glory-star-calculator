import { calculateDistance } from '../geometry/calculateDistance';
import { GEOMETRY_TOLERANCE } from '../geometry/geometryTolerance';
import type { Movement } from '../models/Movement';

/**
 * Orders whole cutting contours by their nearest endpoint without changing segment lengths.
 * @param movements - Validated, scaled movements; explicit contour boundaries are preserved.
 * @returns Ordered cutting and positioning moves, retaining explicit final positioning.
 */
export function optimizeMovements(movements: Movement[]): Movement[] {
  const paths: Movement[][] = [];
  let path: Movement[] = [];
  for (const movement of movements) {
    if (!movement.isCutting || movement.startsContour ||
        (path.length && calculateDistance(path[path.length - 1].end, movement.start) > GEOMETRY_TOLERANCE)) {
      if (path.length) paths.push(path);
      path = [];
    }
    if (movement.isCutting) path.push(movement);
  }
  if (path.length) paths.push(path);
  if (!paths.length) return movements;
  let position = movements[0].start;
  const optimized: Movement[] = [];
  while (paths.length) {
    let index = 0;
    let reverse = false;
    let bestDistance = Infinity;
    paths.forEach((candidate, i) => {
      const toStart = calculateDistance(position, candidate[0].start);
      const toEnd = calculateDistance(position, candidate[candidate.length - 1].end);
      if (Math.min(toStart, toEnd) < bestDistance) {
        bestDistance = Math.min(toStart, toEnd);
        index = i;
        reverse = toEnd < toStart;
      }
    });
    const next = paths.splice(index, 1)[0];
    const ordered = reverse
      ? next.slice().reverse().map(movement => ({ ...movement, start: movement.end, end: movement.start }))
      : next;
    optimized.push({ start: position, end: ordered[0].start, isCutting: false });
    ordered.forEach((movement, i) => optimized.push({ ...movement, startsContour: i === 0 }));
    position = ordered[ordered.length - 1].end;
  }
  const last = movements[movements.length - 1];
  if (!last.isCutting) optimized.push({ start: position, end: last.end, isCutting: false });
  return optimized;
}
