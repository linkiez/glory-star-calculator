import DxfParser from 'dxf-parser';
import { IArcEntity } from 'dxf-parser/dist/entities/arc';
import { ICircleEntity } from 'dxf-parser/dist/entities/circle';
import { IEntity } from 'dxf-parser/dist/entities/geomtry';
import { IInsertEntity } from 'dxf-parser/dist/entities/insert';
import { ILineEntity } from 'dxf-parser/dist/entities/line';
import { ILwpolylineEntity } from 'dxf-parser/dist/entities/lwpolyline';
import { IPolylineEntity } from 'dxf-parser/dist/entities/polyline';
import { calculateDistance } from '../../geometry/calculateDistance';
import { GEOMETRY_TOLERANCE } from '../../geometry/geometryTolerance';
import type { Movement, Point } from '../../models/index';

const TAU = Math.PI * 2;
type Transform = (point: Point) => Point;

function arcPoints(center: Point, radius: number, start: number, sweep: number): Point[] {
  if (![radius, start, sweep].every(Number.isFinite) || radius <= 0) throw new Error('Arco DXF inválido');
  // Half-degree tessellation keeps relative circle length error below 0.000004.
  const steps = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 360)));
  const angles = Array.from({ length: steps + 1 }, (_, i) => start + sweep * i / steps);
  for (let i = -8; i <= 8; i++) {
    const angle = i * Math.PI / 2;
    const ratio = (angle - start) / sweep;
    if (ratio > 0 && ratio < 1) angles.push(angle);
  }
  angles.sort((a, b) => sweep > 0 ? a - b : b - a);
  return angles.map(angle => ({ x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) }));
}

function polylinePoints(entity: ILwpolylineEntity | IPolylineEntity): Point[] {
  const vertices = entity.vertices;
  if (vertices.length < 2) throw new Error('Polilinha DXF sem segmentos');
  const points: Point[] = [vertices[0]];
  const count = entity.shape ? vertices.length : vertices.length - 1;
  for (let i = 0; i < count; i++) {
    const start = vertices[i], end = vertices[(i + 1) % vertices.length];
    const bulge = start.bulge ?? 0;
    if (!Number.isFinite(bulge)) throw new Error('Bulge DXF inválido');
    if (bulge === 0) {
      points.push(end);
      continue;
    }
    const chord = calculateDistance(start, end);
    if (chord === 0) throw new Error('Arco de polilinha DXF degenerado');
    const offset = (1 - bulge * bulge) / (4 * bulge);
    const center = {
      x: (start.x + end.x) / 2 - (end.y - start.y) * offset,
      y: (start.y + end.y) / 2 + (end.x - start.x) * offset
    };
    points.push(...arcPoints(center, calculateDistance(center, start),
      Math.atan2(start.y - center.y, start.x - center.x), 4 * Math.atan(bulge)).slice(1));
    points[points.length - 1] = end;
  }
  return points;
}

function connectContours(paths: Point[][]): Movement[] {
  const remaining = paths.slice();
  const result: Movement[] = [];
  const close = (a: Point, b: Point) => calculateDistance(a, b) <= GEOMETRY_TOLERANCE;
  while (remaining.length) {
    const points = remaining.shift()!.slice();
    while (!close(points[0], points[points.length - 1])) {
      const end = points[points.length - 1];
      const index = remaining.findIndex(path =>
        !close(path[0], path[path.length - 1]) &&
        (close(end, path[0]) || close(end, path[path.length - 1])));
      if (index < 0) {
        const before = remaining.findIndex(path =>
          !close(path[0], path[path.length - 1]) &&
          (close(points[0], path[0]) || close(points[0], path[path.length - 1])));
        if (before < 0) break;
        let next = remaining.splice(before, 1)[0];
        if (!close(points[0], next[next.length - 1])) next = next.slice().reverse();
        points.unshift(...next.slice(0, -1));
        continue;
      }
      let next = remaining.splice(index, 1)[0];
      if (!close(end, next[0])) next = next.slice().reverse();
      points.push(...next.slice(1));
    }
    for (let i = 1; i < points.length; i++) {
      result.push({ start: points[i - 1], end: points[i], isCutting: true, startsContour: i === 1 });
    }
  }
  return result;
}

/**
 * Converts supported planar DXF geometry to connected millimetre cutting contours.
 * @throws Error for unsupported cutting entities, units, transforms or cyclic blocks.
 */
export function processDxf(content: string): Movement[] {
  const dxf = new DxfParser().parseSync(content);
  if (!dxf || !dxf.entities) throw new Error('DXF inválido');
  const units: Record<number, number> = { 0: 1, 1: 25.4, 2: 304.8, 4: 1, 5: 10, 6: 1000, 9: 0.0254, 10: 914.4, 13: 0.001, 14: 100 };
  const unitCode = Number(dxf.header?.$INSUNITS ?? 0);
  const unitScale = units[unitCode];
  if (unitScale === undefined) throw new Error(`Unidade DXF não suportada: ${unitCode}`);
  const paths: Point[][] = [];
  function visit(entity: IEntity, transform: Transform, ancestors: string[]): void {
    if (entity.inPaperSpace || entity.visible === false) return;
    if (['TEXT', 'MTEXT', 'DIMENSION', 'POINT', 'ATTDEF', 'SOLID'].includes(entity.type)) return;
    if (entity.type === 'INSERT') {
      const insert = entity as IInsertEntity;
      const block = dxf!.blocks[insert.name];
      if (!block || ancestors.includes(insert.name) || ancestors.length >= 32) {
        throw new Error(`Bloco DXF ausente ou recursivo: ${insert.name}`);
      }
      const sx = insert.xScale ?? 1, sy = insert.yScale ?? 1;
      const rotation = (insert.rotation ?? 0) * Math.PI / 180;
      if (![sx, sy, rotation].every(Number.isFinite) || sx === 0 || sy === 0) throw new Error('Transformação DXF inválida');
      if (insert.extrusionDirection && (insert.extrusionDirection.x !== 0 ||
          insert.extrusionDirection.y !== 0 || insert.extrusionDirection.z !== 1)) {
        throw new Error('Extrusão DXF não suportada; exporte no plano XY');
      }
      const rows = insert.rowCount ?? 1, columns = insert.columnCount ?? 1;
      if (![rows, columns].every(n => Number.isInteger(n) && n > 0) || rows * columns > 10000) {
        throw new Error('Matriz de blocos DXF inválida ou excessiva');
      }
      for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
        const local: Transform = point => {
          const x = (point.x - (block.position?.x ?? 0)) * sx + col * (insert.columnSpacing ?? 0);
          const y = (point.y - (block.position?.y ?? 0)) * sy + row * (insert.rowSpacing ?? 0);
          return transform({
            x: insert.position.x + x * Math.cos(rotation) - y * Math.sin(rotation),
            y: insert.position.y + x * Math.sin(rotation) + y * Math.cos(rotation)
          });
        };
        for (const child of block.entities ?? []) visit(child, local, [...ancestors, insert.name]);
      }
      return;
    }
    let points: Point[];
    switch (entity.type) {
      case 'LINE':
        points = (entity as ILineEntity).vertices;
        break;
      case 'CIRCLE': {
        const circle = entity as ICircleEntity;
        points = arcPoints(circle.center, circle.radius, 0, TAU);
        points[points.length - 1] = points[0];
        break;
      }
      case 'ARC': {
        const arc = entity as IArcEntity;
        const sweep = ((arc.endAngle - arc.startAngle) % TAU + TAU) % TAU || TAU;
        points = arcPoints(arc.center, arc.radius, arc.startAngle, sweep);
        break;
      }
      case 'LWPOLYLINE':
      case 'POLYLINE': {
        const poly = entity as IPolylineEntity;
        if (poly.is3dPolyline || poly.is3dPolygonMesh || poly.isPolyfaceMesh ||
            poly.includesCurveFitVertices || poly.includesSplineFitVertices) {
          throw new Error('Polilinha DXF não planar ou ajustada; converta para arcos e linhas');
        }
        points = polylinePoints(poly);
        break;
      }
      default:
        throw new Error(`Entidade de corte DXF não suportada: ${entity.type}`);
    }
    if (!points || points.length < 2) throw new Error(`Geometria DXF inválida: ${entity.type}`);
    const planar = entity as IEntity & { extrusionDirectionX?: number; extrusionDirectionY?: number; extrusionDirectionZ?: number; extrusionDirection?: { x: number; y: number; z: number } };
    const extrusion = planar.extrusionDirection;
    if ((planar.extrusionDirectionX ?? extrusion?.x ?? 0) !== 0 ||
        (planar.extrusionDirectionY ?? extrusion?.y ?? 0) !== 0 ||
        (planar.extrusionDirectionZ ?? extrusion?.z ?? 1) !== 1) {
      throw new Error('Extrusão DXF não suportada; exporte no plano XY');
    }
    const mapped = points.map(transform);
    mapped.forEach(point => calculateDistance(point, point));
    paths.push(mapped);
  }
  for (const entity of dxf.entities) visit(entity, p => ({ x: p.x * unitScale, y: p.y * unitScale }), []);
  return connectContours(paths);
}
