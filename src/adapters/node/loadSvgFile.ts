import { readFileSync } from 'node:fs';

/**
 * Loads SVG text from a Node.js filesystem.
 * @param filePath - Path to an existing SVG file.
 * @returns UTF-8 drawing content.
 * @throws Error when the filesystem read fails.
 */
export function loadSvgFile(filePath: string): string {
  return readFileSync(filePath, 'utf8');
}
