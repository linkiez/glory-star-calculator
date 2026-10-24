import { calculateCuttingTimeFromSvg } from '../../formats/svg/calculateCuttingTimeFromSvg';
import type { CuttingTimeOptions } from '../../models/CuttingTimeOptions';
import type { CuttingTimeResult } from '../../models/CuttingTimeResult';
import { loadSvgFile } from './loadSvgFile';

/**
 * Adapts filesystem input to the platform-independent SVG calculator.
 * @param filePath - Path to an SVG drawing.
 * @param options - Cutting process parameters.
 * @returns The same estimate as the string-based SVG API.
 * @throws Error for filesystem, geometry or process failures.
 */
export function calculateCuttingTimeFromFile(filePath: string, options: CuttingTimeOptions): CuttingTimeResult {
  return calculateCuttingTimeFromSvg(loadSvgFile(filePath), options);
}
