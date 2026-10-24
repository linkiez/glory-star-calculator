import { CuttingTimeResult, Movement } from '../models';

/** Adds cutting-only bounds; positioning and leads without geometry do not enlarge the drawing. */
export function withCutBounds(result: CuttingTimeResult, movements: Movement[], scale: number): CuttingTimeResult {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const movement of movements) {
    if (!movement.isCutting) continue;
    for (const point of [movement.start, movement.end]) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }
  if (minX !== Infinity) {
    result.cutAreaWidth = (maxX - minX) * scale;
    result.cutAreaHeight = (maxY - minY) * scale;
  }
  return result;
}
