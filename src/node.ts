import * as fs from 'fs';
import { calculateCuttingTimeFromSvg } from './cuttingCalculator';
import { CuttingTimeOptions, CuttingTimeResult } from './types';

export function loadSvgFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

export function calculateCuttingTimeFromFile(
  filePath: string,
  options: CuttingTimeOptions
): CuttingTimeResult {
  const svgContent = loadSvgFile(filePath);
  return calculateCuttingTimeFromSvg(svgContent, options);
}
