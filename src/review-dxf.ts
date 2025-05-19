import DxfParser from 'dxf-parser';
import fs from 'fs';

const dxf = fs.readFileSync('./src/LPEL-1530.dxf', 'utf8');
const parser = new DxfParser();
const parsed = parser.parseSync(dxf);
const filtered = parsed?.entities ? (parsed.entities as any[]).filter((e: any) => ['LINE','CIRCLE','ARC','LWPOLYLINE','POLYLINE'].includes(e.type)) : [];
filtered.forEach((e: any, i: number) => {
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
    console.log(`#${i} ${e.type}: pontos=${e.vertices.length}`);
  }
});
