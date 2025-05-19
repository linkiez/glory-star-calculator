import DxfParser from 'dxf-parser';
import fs from 'fs';

const dxf = fs.readFileSync('./src/LPEL-1530.dxf', 'utf8');
const parser = new DxfParser();
const parsed = parser.parseSync(dxf);

const allTypes: Record<string, number> = {};
if (parsed && parsed.entities) {
  (parsed.entities as any[]).forEach((e: any) => {
    allTypes[e.type] = (allTypes[e.type] ?? 0) + 1;
  });
}
console.log('Tipos de entidades encontrados no DXF:');
console.log(allTypes);

const relevant = ['LINE','CIRCLE','ARC','LWPOLYLINE','POLYLINE'];
const processed = parsed && parsed.entities ? (parsed.entities as any[]).filter((e: any) => relevant.includes(e.type)) : [];
console.log('\nEntidades processadas:');
processed.forEach((e: any, i: number) => {
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
console.log(`Total de entidades no arquivo: ${parsed && parsed.entities ? parsed.entities.length : 0}`);

const notProcessed = parsed && parsed.entities ? (parsed.entities as any[]).filter((e: any) => !relevant.includes(e.type)) : [];
if(notProcessed.length > 0){
  console.log('\nEntidades NÃO processadas:');
  notProcessed.forEach((e: any, i: number) => {
    console.log(`#${i} ${e.type}`);
  });
} else {
  console.log('\nTodas as entidades relevantes estão sendo processadas.');
}
