import { PathArray } from '@svgdotjs/svg.js';
import { calculateDistance } from '../../geometry/calculateDistance';
import type { Point } from '../../models/Point';
import type { ProcessedSVGElement } from './ProcessedSVGElement';
import { SVGElementType } from './SVGElementType';

function bezierPoints(control: Point[], depth = 0): Point[] {
  let polygonLength = 0;
  for (let i = 1; i < control.length; i++) polygonLength += calculateDistance(control[i - 1], control[i]);
  if (polygonLength - calculateDistance(control[0], control[control.length - 1]) < 1e-5) {
    return [control[control.length - 1]];
  }
  if (depth >= 20) throw new Error('Curva SVG excede a precisão suportada');
  const left = [control[0]], right = [control[control.length - 1]];
  let row = control;
  while (row.length > 1) {
    row = row.slice(1).map((point, i) => ({
      x: (row[i].x + point.x) / 2, y: (row[i].y + point.y) / 2
    }));
    left.push(row[0]);
    right.unshift(row[row.length - 1]);
  }
  return [...bezierPoints(left, depth + 1), ...bezierPoints(right, depth + 1)];
}

function arcPoints(start: Point, end: Point, rx: number, ry: number, degrees: number, large: number, sweep: number): Point[] {
  if (![0, 1].includes(large) || ![0, 1].includes(sweep)) throw new Error('Flags de arco SVG inválidas');
  if (calculateDistance(start, end) === 0) return [];
  rx = Math.abs(rx); ry = Math.abs(ry);
  if (rx === 0 || ry === 0) return [end];
  const rotation = degrees * Math.PI / 180;
  const cos = Math.cos(rotation), sin = Math.sin(rotation);
  const dx = (start.x - end.x) / 2, dy = (start.y - end.y) / 2;
  const x = cos * dx + sin * dy, y = -sin * dx + cos * dy;
  const correction = Math.sqrt(x * x / (rx * rx) + y * y / (ry * ry));
  if (correction > 1) { rx *= correction; ry *= correction; }
  const numerator = rx * rx * ry * ry - rx * rx * y * y - ry * ry * x * x;
  const denominator = rx * rx * y * y + ry * ry * x * x;
  const factor = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, numerator / denominator));
  const cx = factor * rx * y / ry, cy = -factor * ry * x / rx;
  const center = {
    x: cos * cx - sin * cy + (start.x + end.x) / 2,
    y: sin * cx + cos * cy + (start.y + end.y) / 2
  };
  const first = Math.atan2((y - cy) / ry, (x - cx) / rx);
  const last = Math.atan2((-y - cy) / ry, (-x - cx) / rx);
  let angle = last - first;
  if (sweep === 1 && angle < 0) angle += 2 * Math.PI;
  if (sweep === 0 && angle > 0) angle -= 2 * Math.PI;
  const steps = Math.max(1, Math.ceil(Math.abs(angle) / (Math.PI / 360)));
  const points: Point[] = [];
  for (let i = 1; i < steps; i++) {
    const theta = first + angle * i / steps;
    points.push({
      x: center.x + cos * rx * Math.cos(theta) - sin * ry * Math.sin(theta),
      y: center.y + sin * rx * Math.cos(theta) + cos * ry * Math.sin(theta)
    });
  }
  points.push(end);
  return points;
}

/** Parses all standard SVG path commands with the installed SVG.js parser and flattens curves. */
export function svgPathElements(data: string): ProcessedSVGElement[] {
  if (!data.trim()) return [];
  if (/[^MmLlHhVvCcSsQqTtAaZzEe0-9.,+\-\s]/.test(data)) throw new Error('Comando SVG inválido');
  const commands = new PathArray(data).valueOf();
  const explicitCommands = data.match(/[MmLlHhVvCcSsQqTtAaZz]/g) ?? [];
  if (commands.length < explicitCommands.length) throw new Error('Caminho SVG com comando incompleto');
  if (!commands.length || commands[0][0] !== 'M') throw new Error('Caminho SVG deve começar com moveto');
  const elements: ProcessedSVGElement[] = [];
  let points: Point[] = [];
  let current: Point = { x: 0, y: 0 }, start = current;
  let previous = '', cubicControl = current, quadraticControl = current;
  const reflect = (point: Point): Point => ({ x: 2 * current.x - point.x, y: 2 * current.y - point.y });
  function finish(closed: boolean): void {
    if (points.length > 1) elements.push({ type: SVGElementType.Path, points, isClosed: closed });
    points = [];
  }
  for (const command of commands) {
    if (!command.slice(1).every(value => typeof value === 'number' && Number.isFinite(value))) {
      throw new Error('Coordenadas SVG inválidas');
    }
    switch (command[0]) {
      case 'M':
        finish(false);
        current = { x: command[1], y: command[2] };
        start = current;
        points = [current];
        break;
      case 'L': points.push({ x: command[1], y: command[2] }); break;
      case 'H': points.push({ x: command[1], y: current.y }); break;
      case 'V': points.push({ x: current.x, y: command[1] }); break;
      case 'C': {
        const first = { x: command[1], y: command[2] };
        cubicControl = { x: command[3], y: command[4] };
        points.push(...bezierPoints([current, first, cubicControl, { x: command[5], y: command[6] }]));
        break;
      }
      case 'S': {
        const first = ['C', 'S'].includes(previous) ? reflect(cubicControl) : current;
        cubicControl = { x: command[1], y: command[2] };
        points.push(...bezierPoints([current, first, cubicControl, { x: command[3], y: command[4] }]));
        break;
      }
      case 'Q':
        quadraticControl = { x: command[1], y: command[2] };
        points.push(...bezierPoints([current, quadraticControl, { x: command[3], y: command[4] }]));
        break;
      case 'T':
        quadraticControl = ['Q', 'T'].includes(previous) ? reflect(quadraticControl) : current;
        points.push(...bezierPoints([current, quadraticControl, { x: command[1], y: command[2] }]));
        break;
      case 'A':
        points.push(...arcPoints(current, { x: command[6], y: command[7] },
          command[1], command[2], command[3], command[4], command[5]));
        break;
      case 'Z':
        points.push(start);
        finish(true);
        current = start;
        break;
      default: throw new Error(`Comando SVG não suportado: ${command[0]}`);
    }
    if (points.length) current = points[points.length - 1];
    else if (command[0] === 'Z') points = [current];
    previous = command[0];
  }
  finish(false);
  return elements;
}
