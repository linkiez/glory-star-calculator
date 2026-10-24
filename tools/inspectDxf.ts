import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import DxfParser from 'dxf-parser';
import { calculateCuttingTimeFromDxf } from '../src';

const [inputPath, thicknessInput = '3', ...extraArguments] = process.argv.slice(2);
if (extraArguments.length > 0) {
  throw new Error('Uso: npm run inspect:dxf -- [arquivo.dxf] [espessura-mm]');
}

const filePath = inputPath
  ? resolve(inputPath)
  : resolve(__dirname, '../fixtures/drawings/LPEL-1530.dxf');
const content = readFileSync(filePath, 'utf8');
const drawing = new DxfParser().parseSync(content);
if (!drawing) throw new Error('Não foi possível interpretar o DXF');

const entityCounts: Record<string, number> = {};
for (const entity of drawing.entities) {
  entityCounts[entity.type] = (entityCounts[entity.type] ?? 0) + 1;
}
const materialThickness = Number(thicknessInput);
const estimates = [false, true].map(optimize => ({
  optimize,
  ...calculateCuttingTimeFromDxf(content, { materialThickness, optimize })
}));

console.log(JSON.stringify({ arquivo: filePath, entidades: entityCounts, estimativas: estimates }, null, 2));
