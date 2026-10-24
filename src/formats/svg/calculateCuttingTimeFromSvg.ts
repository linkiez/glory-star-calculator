import { calculateDrawingTime } from '../../calculation/calculateDrawingTime';
import { convertElementsToMovements } from './convertElementsToMovements';
import { processSvg } from './processSvg';
import type { CuttingTimeOptions, CuttingTimeResult } from '../../models/index';

/** Adapts SVG input to the common drawing-time Facade, preserving subpath boundaries. */
export function calculateCuttingTimeFromSvg(svgContent: string, options: CuttingTimeOptions): CuttingTimeResult {
  const movements = convertElementsToMovements(processSvg(svgContent));
  return calculateDrawingTime(movements, options);
}
