import { calculateDrawingTime } from '../../calculation/calculateDrawingTime';
import { processDxf } from './processDxf';
import type { CuttingTimeOptions, CuttingTimeResult } from '../../models/index';

/** Adapts planar DXF input to the common drawing-time Facade after unit conversion. */
export function calculateCuttingTimeFromDxf(content: string, options: CuttingTimeOptions): CuttingTimeResult {
  const movements = processDxf(content);
  return calculateDrawingTime(movements, options);
}
