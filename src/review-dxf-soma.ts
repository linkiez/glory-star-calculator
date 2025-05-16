import fs from 'fs';
import DxfParser from 'dxf-parser';
import { calculateCuttingTimeFromDxf } from './cuttingCalculator.js';

const dxf = fs.readFileSync('./src/LPEL-1530.dxf', 'utf8');
const result = calculateCuttingTimeFromDxf(dxf, { materialThickness: 3, optimize: true });

console.log('Distância de corte:', result.cuttingDistance.toFixed(4), 'mm');
console.log('Distância de movimento:', result.movementDistance.toFixed(4), 'mm');
console.log('Soma total:', (result.cuttingDistance + result.movementDistance).toFixed(4), 'mm');
