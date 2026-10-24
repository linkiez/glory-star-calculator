/**
 * Exemplo de uso da biblioteca GloryStar Calculator
 * 
 * Este arquivo demonstra como calcular o tempo de corte a partir de um arquivo SVG
 * para a máquina GloryStar_GS3015, considerando diferentes espessuras de chapa.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  calculateCuttingTimeFromDxf,
  calculateCuttingTimeFromSvg
} from '../src';
import type { CuttingTimeResult } from '../src';

// Exemplo universal (browser e Node.js)
const svgString = `
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="80" fill="none" stroke="black" />
</svg>
`;

const result = calculateCuttingTimeFromSvg(svgString, {
  materialThickness: 5.0,
  optimize: true
});

console.log('Tempo total de corte:', result.totalTimeSec, 'segundos');
console.log('Distância de corte:', result.cuttingDistance, 'mm');

// Exemplo Node.js (apenas para ambiente Node)
// Descomente para testar em Node.js
// import { calculateCuttingTimeFromFile, loadSvgFile } from '../src/node';
// const fileResult = calculateCuttingTimeFromFile('/caminho/para/arquivo.svg', { materialThickness: 3.0 });
// console.log('Tempo total para arquivo:', fileResult.totalTimeSec, 'segundos');

// Exemplo de uso com string SVG
function exampleWithSvgString(svgString: string, materialThickness: number): void {
  console.log('\nCalculando tempo de corte para SVG fornecido como string');
  console.log(`Espessura do material: ${materialThickness}mm`);
  displayResults(calculateCuttingTimeFromSvg(svgString, { materialThickness, optimize: true }));
}

// Função auxiliar para exibir os resultados
function displayResults(result: CuttingTimeResult): void {
  console.log('\n--- RESULTADOS DO CÁLCULO DE TEMPO ---');
  console.log(`Tempo total: ${formatTime(result.totalTimeSec)}`);
  console.log(`Tempo de corte: ${formatTime(result.cuttingTimeSec)}`);
  console.log(`Tempo de movimento: ${formatTime(result.movementTimeSec)}`);
  console.log(`Tempo de perfuração: ${formatTime(result.piercingTimeSec)}`);
  console.log(`Tempo de configuração: ${formatTime(result.setupTimeSec)}`);
  console.log('\n--- DISTÂNCIAS ---');
  console.log(`Distância total: ${result.totalDistance.toFixed(2)}mm`);
  console.log(`Distância de corte: ${result.cuttingDistance.toFixed(2)}mm`);
  console.log(`Distância de movimento: ${result.movementDistance.toFixed(2)}mm`);
  if (result.cutAreaWidth !== undefined && result.cutAreaHeight !== undefined) {
    console.log(`\n--- ÁREA DE CORTE ---`);
    console.log(`Largura da área de corte: ${result.cutAreaWidth.toFixed(2)}mm`);
    console.log(`Altura da área de corte: ${result.cutAreaHeight.toFixed(2)}mm`);
  }
  console.log('\n--- CONTAGENS ---');
  console.log(`Número de perfurações: ${result.pierceCount}`);
  console.log(`Número de contornos: ${result.partCount}`);
  console.log('-----------------------------------');
}

// Função para formatar tempo em formato legível (hh:mm:ss)
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')} (${seconds.toFixed(2)}s)`;
}

// Exemplo de SVG simples para teste
const simpleSvg = `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="80" fill="none" stroke="black" />
  <circle cx="150" cy="50" r="30" fill="none" stroke="black" />
  <polyline points="10,120 50,140 90,120 130,140 170,120" fill="none" stroke="black" />
  <path d="M10,180 L50,160 Q90,190 130,160 L170,180 Z" fill="none" stroke="black" />
</svg>
`;

// SVG fornecido pelo usuário para teste real
const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="2538.73653356485 -1326.094349562924 122.17508126759594 160.18219740666996" width="100%" height="100%">
  <g stroke="#000000" stroke-width="0.1%" fill="none" transform="matrix(1,0,0,-1,0,0)">
    <g stroke="rgb(0, 0, 0)"><path d="M2546.489672567668,1165.912152156254L2626.620560904849,1196.788467228995"></path></g>
<g stroke="rgb(0, 0, 0)"><path d="M 2626.620560904845 1196.7884672289433 A 36.86474077679893 36.86474077679893 0 0 1 2652.736004432073 1235.3597367908787"></path></g>
<g stroke="rgb(0, 0, 0)"><path d="M2652.736004432073,1235.359736790879L2650.915441416322,1270.860072822152"></path></g>
<g stroke="rgb(0, 0, 0)"><path d="M 2604.477656047992 1217.9950904468399 A 7.144878902037318 7.144878902037318 0 0 1 2613.264211136427 1225.2979391932754"></path></g>
<g stroke="rgb(0, 0, 0)"><path d="M2613.264211136427,1225.297939193275L2610.057260903776,1268.238724682979"></path></g>
<g stroke="rgb(0, 0, 0)"><path d="M2546.489672567668,1165.912152156254L2538.73653356485,1181.587865023146"></path></g>
<g stroke="rgb(0, 0, 0)"><path d="M2538.73653356485,1181.587865023146L2587.165049480899,1207.027764946095"></path></g>
<g stroke="rgb(0, 0, 0)"><path d="M 2604.4776560479927 1217.9950904468392 A 12.0962138469312 12.0962138469312 0 0 1 2588.214401348259 1208.5123508831027"></path></g>
<g stroke="rgb(0, 0, 0)"><path d="M 2587.1650494808982 1207.0277649460943 A 2 2 0 0 1 2588.2144013482543 1208.5123508831034"></path></g>
<g stroke="rgb(0, 0, 0)"><path d="M 2650.915441416321 1270.8600728221522 A 32 32 0 1 1 2610.057260903776 1268.238724682979"></path></g>
<g stroke="rgb(0, 0, 0)"><circle cx="2577.365041887568" cy="1189.589457935647" r="3"></circle></g>
<g stroke="rgb(0, 0, 0)"><circle cx="2628.911614832446" cy="1294.094349562924" r="12.75"></circle></g>
<g stroke="rgb(0, 0, 0)"><circle cx="2552.745842226383" cy="1178.503655842763" r="4.099999999999999"></circle></g>
  </g>
</svg>`;

console.log('\n=== TESTE COM SVG DO USUÁRIO (espessura 6,35mm) ===');
exampleWithSvgString(userSvg, 6.35);

console.log('Referência registrada neste exemplo: 53 s; confirmar receita e condições na máquina.');
console.log('scaleFactor representa geometria e não deve ser ajustado para forçar esse tempo.');

// Exemplo de string DXF simples (linha e círculo)
const dxfString = `0\nSECTION\n2\nENTITIES\n0\nLINE\n8\n0\n10\n0\n20\n0\n11\n100\n21\n0\n0\nCIRCLE\n8\n0\n10\n50\n20\n50\n40\n25\n0\nENDSEC\n0\nEOF\n`;

console.log('\n=== TESTE COM DXF (linha e círculo) ===');
const dxfResult = calculateCuttingTimeFromDxf(dxfString, { materialThickness: 3, optimize: true });
console.log('Tempo total DXF:', dxfResult.totalTimeSec, 'segundos');
console.log('Distância de corte DXF:', dxfResult.cuttingDistance, 'mm');

// Execute os exemplos com diferentes espessuras
console.log('=== EXEMPLOS DE CÁLCULO DE TEMPO DE CORTE ===');

// Exemplo com string SVG para diferentes espessuras
[1.0, 3.0, 5.0, 10.0, 12.7].forEach(thickness => {
  exampleWithSvgString(simpleSvg, thickness);
});

// Recorded targets lack a confirmed recipe; they are not calibration coefficients.
const thicknessTargets = [
  { thickness: 3.0, targetTime: 23 },
  { thickness: 1.5, targetTime: 17 },
  { thickness: 6.35, targetTime: 44 },
  { thickness: 12.7, targetTime: 73 }
];
for (const filename of ['quadrado.dxf', 'redondo.dxf']) {
  const content = readFileSync(resolve(__dirname, '../fixtures/drawings', filename), 'utf8');
  for (const { thickness, targetTime } of thicknessTargets) {
    const estimate = calculateCuttingTimeFromDxf(content, { materialThickness: thickness, optimize: true });
    console.log(`\n=== ${filename} | Espessura: ${thickness}mm | Referência não verificada: ${targetTime}s ===`);
    displayResults(estimate);
    console.log(`Diferença de tempo: ${(estimate.totalTimeSec - targetTime).toFixed(2)}s`);
  }
}