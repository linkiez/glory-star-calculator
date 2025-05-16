import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxf = fs.readFileSync('./src/LPEL-1530.dxf', 'utf8');
const parser = new DxfParser();
const parsed = parser.parseSync(dxf);

const allTypes = {};
parsed.entities.forEach(e => {
  allTypes[e.type] = (allTypes[e.type] || 0) + 1;
});
console.log('Tipos de entidades encontrados no DXF:');
console.log(allTypes);

const relevant = ['LINE','CIRCLE','ARC','LWPOLYLINE','POLYLINE'];
const processed = parsed.entities.filter(e => relevant.includes(e.type));
console.log('\nEntidades processadas:');
processed.forEach((e,i) => {
  if(e.type==='LINE'){
    if(e.vertices){
      console.log(`#${i} LINE: (${e.vertices.map((v:any)=>`(${v.x},${v.y})`).join(' -> ')})`);
    } else {
      console.log(`#${i} LINE: (${e.x1},${e.y1} -> ${e.x2},${e.y2})`);
    }
  } else if(e.type==='CIRCLE'){
    console.log(`#${i} CIRCLE: center=(${e.center.x},${e.center.y}), r=${e.radius}`);
  } else if(e.type==='ARC'){
    console.log(`#${i} ARC: center=(${e.center.x},${e.center.y}), r=${e.radius}, start=${e.startAngle}, end=${e.endAngle}`);
  } else if(e.type==='LWPOLYLINE'||e.type==='POLYLINE'){
    console.log(`#${i} ${e.type}: pontos=${e.vertices.length}, closed=${e.closed}`);
  }
});

console.log(`\nTotal de entidades processadas: ${processed.length}`);
console.log(`Total de entidades no arquivo: ${parsed.entities.length}`);

const notProcessed = parsed.entities.filter(e => !relevant.includes(e.type));
if(notProcessed.length > 0){
  console.log('\nEntidades NÃO processadas:');
  notProcessed.forEach((e,i) => {
    console.log(`#${i} ${e.type}`);
  });
} else {
  console.log('\nTodas as entidades relevantes estão sendo processadas.');
}
