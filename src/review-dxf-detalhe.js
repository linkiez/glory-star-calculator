const fs = require('fs');
const DxfParser = require('dxf-parser');
const { calculateDistance } = require('./cuttingCalculator');
const dxf = fs.readFileSync('./src/LPEL-0040.dxf', 'utf8');
const parser = new DxfParser();
const parsed = parser.parseSync(dxf);

console.log('--- Detalhamento de comprimento de cada entidade ---');
let total = 0;
let idx = 0;
parsed.entities.forEach((e) => {
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
