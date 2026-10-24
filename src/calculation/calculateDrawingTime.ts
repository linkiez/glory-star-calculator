import { withCutBounds } from '../geometry/withCutBounds';
import type { CuttingTimeOptions, CuttingTimeResult, Movement } from '../models/index';
import { calculateCuttingTime } from './calculateCuttingTime';

/**
 * Provides the shared Facade for format adapters: validated timing and scaled drawing bounds.
 * @param movements - Drawing geometry in millimetres before geometric scaling.
 * @param options - Process parameters shared by every input format.
 * @returns A consistent estimate and bounding dimensions.
 */
export function calculateDrawingTime(movements: Movement[], options: CuttingTimeOptions): CuttingTimeResult {
  return withCutBounds(calculateCuttingTime(movements, options), movements, options.scaleFactor ?? 1);
}
