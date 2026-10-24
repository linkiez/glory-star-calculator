import { Point } from '../models';

/** Returns the Euclidean distance between finite points, in drawing units. */
export function calculateDistance(start: Point, end: Point): number {
  if (![start.x, start.y, end.x, end.y].every(Number.isFinite)) {
    throw new Error('Coordenadas devem ser números finitos');
  }
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  if (!Number.isFinite(distance)) throw new Error('Distância fora do intervalo numérico');
  return distance;
}
