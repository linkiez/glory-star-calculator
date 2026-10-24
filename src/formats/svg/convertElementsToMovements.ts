import { calculateDistance } from '../../geometry/calculateDistance';
import { GEOMETRY_TOLERANCE } from '../../geometry/geometryTolerance';
import type { Movement } from '../../models/Movement';
import type { ProcessedSVGElement } from './ProcessedSVGElement';

/** Converts SVG subpaths to cutting moves, preserving laser-off boundaries even at touching endpoints. */
export function convertElementsToMovements(elements: ProcessedSVGElement[]): Movement[] {
  const movements: Movement[] = [];
  let position = { x: 0, y: 0 };
  for (const element of elements) {
    const points = element.points.slice();
    if (points.length < 2) continue;
    if (element.isClosed && calculateDistance(points[0], points[points.length - 1]) > GEOMETRY_TOLERANCE) points.push(points[0]);
    movements.push({ start: position, end: points[0], isCutting: false });
    for (let i = 1; i < points.length; i++) {
      movements.push({ start: points[i - 1], end: points[i], isCutting: true, startsContour: i === 1 });
    }
    position = points[points.length - 1];
  }
  return movements;
}
