// Funções exclusivas para Node.js (dependem de fs)
import { calculateCuttingTimeFromSvg } from './cuttingCalculator';
import { loadSvgFile } from './svgProcessor';
import { CuttingTimeOptions, CuttingTimeResult } from './types';

/**
 * Calcula o tempo de corte a partir do caminho de um arquivo SVG (Node.js)
 */
export function calculateCuttingTimeFromFile(
  filePath: string,
  options: CuttingTimeOptions
): CuttingTimeResult {
  const svgContent = loadSvgFile(filePath);
  return calculateCuttingTimeFromSvg(svgContent, options);
}

export { loadSvgFile };
