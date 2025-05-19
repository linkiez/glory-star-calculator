import fs from 'fs';
import { calculateCuttingTimeFromDxf } from './cuttingCalculator';
import { Movement } from './types';

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const dxfFile = process.argv[2] || './src/LPEL-1530.dxf';
const thickness = Number(process.argv[3]) || 3;
const dxf = fs.readFileSync(dxfFile, 'utf8');

// --- Embaralhar movimentos para simular segmentos desconectados ---
const { calculateCuttingTime } = require('./cuttingCalculator');
const parser = new (require('dxf-parser'))();
const parsed = parser.parseSync(dxf);
const movements: Movement[] = [];
if (parsed && parsed.entities) {
  console.log('\n--- POSIÇÕES DAS ENTIDADES ---');
  for (const entity of parsed.entities) {
    if (entity.type === 'CIRCLE' && entity.center) {
      console.log(`CIRCLE: center=(${entity.center.x.toFixed(2)}, ${entity.center.y.toFixed(2)}), r=${entity.radius}`);
    } else if (entity.type === 'LINE') {
      if (entity.vertices && entity.vertices.length === 2) {
        console.log(`LINE: (${entity.vertices[0].x.toFixed(2)}, ${entity.vertices[0].y.toFixed(2)}) -> (${entity.vertices[1].x.toFixed(2)}, ${entity.vertices[1].y.toFixed(2)})`);
      } else {
        console.log(`LINE: (${entity.x1.toFixed(2)}, ${entity.y1.toFixed(2)}) -> (${entity.x2.toFixed(2)}, ${entity.y2.toFixed(2)})`);
      }
    } else if (entity.type === 'ARC' && entity.center) {
      console.log(`ARC: center=(${entity.center.x.toFixed(2)}, ${entity.center.y.toFixed(2)}), r=${entity.radius}, start=${entity.startAngle}, end=${entity.endAngle}`);
    } else if (entity.type === 'LWPOLYLINE' && entity.vertices) {
      const pts = entity.vertices.map((v: any) => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)})`).join(' -> ');
      console.log(`LWPOLYLINE: ${pts}`);
    }
  }
  for (const entity of parsed.entities) {
    if (entity.type === 'CIRCLE') {
      const steps = 32;
      const points = [];
      for (let i = 0; i < steps; i++) {
        const angle = (2 * Math.PI * i) / steps;
        points.push({
          x: entity.center.x + entity.radius * Math.cos(angle),
          y: entity.center.y + entity.radius * Math.sin(angle)
        });
      }
      for (let i = 0; i < steps; i++) {
        movements.push({
          start: points[i],
          end: points[(i + 1) % steps],
          isCutting: true
        });
      }
    }
    // ...pode adicionar outros tipos se quiser...
  }
}
shuffleArray(movements);
const resultShuffled = calculateCuttingTime(movements, { materialThickness: thickness, optimize: true });
console.log('\n--- TESTE EMBARALHADO (simula segmentos desconectados) ---');
console.log('Distância de corte:', resultShuffled.cuttingDistance.toFixed(4), 'mm');
console.log('Distância de movimento:', resultShuffled.movementDistance.toFixed(4), 'mm');
console.log('Tempo total:', resultShuffled.totalTimeSec.toFixed(2), 's');

// Exemplo artificial: 3 círculos em locais distantes
function makeCircleMovements(cx: number, cy: number, r: number, steps = 32): Movement[] {
  const points = [];
  for (let i = 0; i < steps; i++) {
    const angle = (2 * Math.PI * i) / steps;
    points.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    });
  }
  const moves: Movement[] = [];
  for (let i = 0; i < steps; i++) {
    moves.push({
      start: points[i],
      end: points[(i + 1) % steps],
      isCutting: true
    });
  }
  return moves;
}

const artificialMovements: Movement[] = [
  ...makeCircleMovements(0, 0, 10),
  ...makeCircleMovements(100, 0, 10),
  ...makeCircleMovements(0, 100, 10)
];

shuffleArray(artificialMovements);
const resultArtificial = calculateCuttingTime(artificialMovements, { materialThickness: thickness, optimize: true });
console.log('\n--- EXEMPLO ARTIFICIAL (3 círculos desconectados, embaralhados) ---');
console.log('Distância de corte:', resultArtificial.cuttingDistance.toFixed(4), 'mm');
console.log('Distância de movimento:', resultArtificial.movementDistance.toFixed(4), 'mm');
console.log('Tempo total:', resultArtificial.totalTimeSec.toFixed(2), 's');

// COMPARATIVO OTIMIZAÇÃO
const resultOptimized = calculateCuttingTimeFromDxf(dxf, { materialThickness: thickness, optimize: true });
const resultRaw = calculateCuttingTimeFromDxf(dxf, { materialThickness: thickness, optimize: false });

console.log('Arquivo:', dxfFile);
console.log('Espessura:', thickness, 'mm');
console.log('\n--- COMPARATIVO ---');
console.log('Modo NÃO otimizado:');
console.log('  Distância de corte:', resultRaw.cuttingDistance.toFixed(4), 'mm');
console.log('  Distância de movimento:', resultRaw.movementDistance.toFixed(4), 'mm');
console.log('  Soma total:', (resultRaw.cuttingDistance + resultRaw.movementDistance).toFixed(4), 'mm');
console.log('  Tempo total:', resultRaw.totalTimeSec.toFixed(2), 's');
if (typeof resultRaw.cutAreaWidth === 'number' && typeof resultRaw.cutAreaHeight === 'number') {
  console.log('  Área de corte:', resultRaw.cutAreaWidth.toFixed(2), 'x', resultRaw.cutAreaHeight.toFixed(2), 'mm');
}
console.log('\nModo OTIMIZADO:');
console.log('  Distância de corte:', resultOptimized.cuttingDistance.toFixed(4), 'mm');
console.log('  Distância de movimento:', resultOptimized.movementDistance.toFixed(4), 'mm');
console.log('  Soma total:', (resultOptimized.cuttingDistance + resultOptimized.movementDistance).toFixed(4), 'mm');
console.log('  Tempo total:', resultOptimized.totalTimeSec.toFixed(2), 's');
if (typeof resultOptimized.cutAreaWidth === 'number' && typeof resultOptimized.cutAreaHeight === 'number') {
  console.log('  Área de corte:', resultOptimized.cutAreaWidth.toFixed(2), 'x', resultOptimized.cutAreaHeight.toFixed(2), 'mm');
}
