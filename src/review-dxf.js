const fs = require('fs');
const DxfParser = require('dxf-parser');
const dxf = fs.readFileSync('./src/LPEL-0040.dxf', 'utf8');
const parser = new DxfParser();
const parsed = parser.parseSync(dxf);
const filtered = parsed.entities.filter(e => ['LINE','CIRCLE','ARC','LWPOLYLINE','POLYLINE'].includes(e.type));
filtered.forEach((e,i) => {
  if(e.type==='LINE'){
    if(e.vertices){
      console.log(`#${i} LINE: (${e.vertices.map(v=>`(${v.x},${v.y})`).join(' -> ')})`);
    } else {
      console.log(`#${i} LINE: (${e.x1},${e.y1} -> ${e.x2},${e.y2})`);
    }
  } else if(e.type==='CIRCLE'){
    console.log(`#${i} CIRCLE: center=(${e.center.x},${e.center.y}), r=${e.radius}`);
  } else if(e.type==='ARC'){
    console.log(`#${i} ARC: center=(${e.center.x},${e.center.y}), r=${e.radius}, start=${e.startAngle}, end=${e.endAngle}`);
  } else if(e.type==='LWPOLYLINE'||e.type==='POLYLINE'){
    console.log(`#${i} ${e.type}: pontos=${e.vertices.length}`);
  }
});
