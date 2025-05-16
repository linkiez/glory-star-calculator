const fs = require('fs');
const DxfParser = require('dxf-parser');
const dxf = fs.readFileSync('./src/LPEL-0040.dxf', 'utf8');
const parser = new DxfParser();
const { calculateCuttingTimeFromDxf } = require('./cuttingCalculator');

const result = calculateCuttingTimeFromDxf(dxf, { materialThickness: 3, optimize: true });

console.log('Distância de corte:', result.cuttingDistance.toFixed(4), 'mm');
console.log('Distância de movimento:', result.movementDistance.toFixed(4), 'mm');
console.log('Soma total:', (result.cuttingDistance + result.movementDistance).toFixed(4), 'mm');
