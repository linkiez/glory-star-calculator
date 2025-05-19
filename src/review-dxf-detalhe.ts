import DxfParser from 'dxf-parser';
import fs from 'fs';
import { calculateCuttingTimeFromDxf, calculateDistance } from './cuttingCalculator';

const dxf = fs.readFileSync('./src/LPEL-1530.dxf', 'utf8');
const parser = new DxfParser();
const parsed = parser.parseSync(dxf);

if (!parsed || !parsed.entities) {
  console.error('DXF não pôde ser lido ou não possui entidades.');
  process.exit(1);
}

console.log('--- Detalhamento de comprimento de cada entidade ---');
let total = 0;
let idx = 0;
parsed.entities.forEach((e: any) => {
  let len = 0;
  if (e.type === 'LINE') {
    if (e.vertices && e.vertices.length === 2) {
      len = calculateDistance(e.vertices[0], e.vertices[1]);
    } else {
      len = calculateDistance({ x: e.x1, y: e.y1 }, { x: e.x2, y: e.y2 });
    }
    console.log(`#${idx} LINE: ${len.toFixed(4)} mm`);
    total += len;
  } else if (e.type === 'CIRCLE') {
    len = 2 * Math.PI * e.radius;
    console.log(`#${idx} CIRCLE: ${len.toFixed(4)} mm`);
    total += len;
  } else if (e.type === 'ARC') {
    const start = e.startAngle;
    const end = e.endAngle;
    let sweep = end - start;
    if (sweep < 0) sweep += 360;
    len = (Math.PI * 2 * e.radius) * (sweep / 360);
    console.log(`#${idx} ARC: ${len.toFixed(4)} mm (ângulo: ${sweep}°)`);
    total += len;
  }
  idx++;
});
console.log('-----------------------------------------------');
console.log('Soma total das entidades:', total.toFixed(4), 'mm');

// Comparação automática com valores esperados
const esperadoDistancia = 486;
const esperadoTempo = 17;

const result = calculateCuttingTimeFromDxf(dxf, { materialThickness: 3, optimize: true });

console.log('\n--- Comparação automática ---');
console.log('Distância de corte calculada:', result.cuttingDistance.toFixed(4), 'mm');
console.log('Tempo total calculado:', result.totalTimeSec.toFixed(2), 's');
console.log('Esperado: 486 mm, 17 s');
console.log('Diferença de distância:', (result.cuttingDistance - esperadoDistancia).toFixed(4), 'mm');
console.log('Diferença de tempo:', (result.totalTimeSec - esperadoTempo).toFixed(2), 's');

// Comparação de entidades do DXF (bruto) e do parser
console.log('\n--- COMPARAÇÃO DE ENTIDADES DXF (BRUTO) x PARSER ---');

// Lê o arquivo DXF como texto e conta entidades brutas
const dxfRaw = dxf;
const entityTypesRaw: Record<string, number> = {};
const entityRegex = /^0\s*([A-Z_]+)$/gm;
let match;
while ((match = entityRegex.exec(dxfRaw)) !== null) {
  const type = match[1];
  entityTypesRaw[type] = (entityTypesRaw[type] || 0) + 1;
}
console.log('Entidades brutas no DXF:');
console.log(entityTypesRaw);

// Conta entidades do parser
const entityTypesParsed: Record<string, number> = {};
(parsed.entities as any[]).forEach(e => {
  entityTypesParsed[e.type] = (entityTypesParsed[e.type] || 0) + 1;
});
console.log('Entidades reconhecidas pelo parser:');
console.log(entityTypesParsed);

// Mostra diferenças
console.log('\nDiferenças entre DXF bruto e parser:');
for (const type in entityTypesRaw) {
  const rawCount = entityTypesRaw[type];
  const parsedCount = entityTypesParsed[type] || 0;
  if (rawCount !== parsedCount) {
    console.log(`Tipo ${type}: DXF=${rawCount}, Parser=${parsedCount}`);
  }
}
for (const type in entityTypesParsed) {
  if (!(type in entityTypesRaw)) {
    console.log(`Tipo ${type}: DXF=0, Parser=${entityTypesParsed[type]}`);
  }
}
