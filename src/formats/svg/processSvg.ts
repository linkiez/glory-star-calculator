import { Matrix } from '@svgdotjs/svg.js';
import { ElementNode, Node, parse } from 'svg-parser';
import { calculateDistance } from '../../geometry/calculateDistance';
import { svgPathElements } from './svgPathElements';
import type { Point } from '../../models/Point';
import type { ProcessedSVGElement } from './ProcessedSVGElement';
import { SVGElementType } from './SVGElementType';

function number(value: string | number | undefined, fallback = 0): number {
  if (value === undefined) return fallback;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || String(value).trim() === '') throw new Error(`Valor SVG inválido: ${value}`);
  return numeric;
}

function numbers(value: string): number[] {
  const tokens = value.match(/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g) ?? [];
  const rest = value.replace(/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g, '').replace(/[\s,]/g, '');
  if (rest) throw new Error('Lista numérica SVG inválida');
  return tokens.map(token => number(token));
}

function transformMatrix(value: string): Matrix {
  let matrix = new Matrix();
  const pattern = /([a-zA-Z]+)\s*\(([^)]*)\)/g;
  let match: RegExpExecArray | null;
  let consumed = 0;
  while ((match = pattern.exec(value))) {
    if (value.slice(consumed, match.index).replace(/[\s,]/g, '')) throw new Error('Transformação SVG inválida');
    const args = numbers(match[2]);
    let next: Matrix;
    switch (match[1]) {
      case 'matrix':
        if (args.length !== 6) throw new Error('Matriz SVG requer 6 números');
        next = new Matrix(args);
        break;
      case 'translate':
        if (args.length < 1 || args.length > 2) throw new Error('Translação SVG inválida');
        next = new Matrix([1, 0, 0, 1, args[0], args[1] ?? 0]);
        break;
      case 'scale':
        if (args.length < 1 || args.length > 2 || args.some(n => n === 0)) throw new Error('Escala SVG inválida');
        next = new Matrix([args[0], 0, 0, args[1] ?? args[0], 0, 0]);
        break;
      case 'rotate': {
        if (args.length !== 1 && args.length !== 3) throw new Error('Rotação SVG inválida');
        const angle = args[0] * Math.PI / 180, x = args[1] ?? 0, y = args[2] ?? 0;
        const cos = Math.cos(angle), sin = Math.sin(angle);
        next = new Matrix([cos, sin, -sin, cos, x - cos * x + sin * y, y - sin * x - cos * y]);
        break;
      }
      case 'skewX':
      case 'skewY': {
        if (args.length !== 1) throw new Error('Inclinação SVG inválida');
        const tangent = Math.tan(args[0] * Math.PI / 180);
        next = match[1] === 'skewX'
          ? new Matrix([1, 0, tangent, 1, 0, 0]) : new Matrix([1, tangent, 0, 1, 0, 0]);
        break;
      }
      default: throw new Error(`Transformação SVG não suportada: ${match[1]}`);
    }
    matrix = matrix.multiply(next);
    consumed = pattern.lastIndex;
  }
  if (value.slice(consumed).trim()) throw new Error('Transformação SVG inválida');
  if (![matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f].every(Number.isFinite)) throw new Error('Matriz SVG inválida');
  return matrix;
}

function physicalLength(value: string | number | undefined): number | undefined {
  if (value === undefined || String(value).endsWith('%')) return undefined;
  const match = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*(mm|cm|m|in|pt|pc|px)?$/i.exec(String(value));
  if (!match) throw new Error('Unidade de viewport SVG não suportada');
  const factors: Record<string, number> = { mm: 1, cm: 10, m: 1000, in: 25.4, pt: 25.4 / 72, pc: 25.4 / 6, px: 25.4 / 96 };
  const length = number(match[1]) * (factors[(match[2] ?? '').toLowerCase()] ?? 1);
  if (length <= 0) throw new Error('Dimensão de viewport SVG deve ser positiva');
  return length;
}

function viewport(root: ElementNode): Matrix {
  const props = root.properties ?? {};
  if (props.viewBox === undefined) {
    // Unitless CAD exports retain the established 1 user unit = 1 mm contract.
    const physical = /(?:mm|cm|m|in|pt|pc|px)$/i.test(String(props.width ?? props.height ?? ''));
    const scale = physical ? 25.4 / 96 : 1;
    return new Matrix([scale, 0, 0, scale, 0, 0]);
  }
  const box = numbers(String(props.viewBox));
  if (box.length !== 4 || box[2] <= 0 || box[3] <= 0) throw new Error('viewBox SVG inválido');
  const width = physicalLength(props.width), height = physicalLength(props.height);
  if (width === undefined || height === undefined) return new Matrix([1, 0, 0, 1, -box[0], -box[1]]);
  let sx = width / box[2], sy = height / box[3], tx = 0, ty = 0;
  const aspect = String(props.preserveAspectRatio ?? 'xMidYMid meet').trim();
  if (aspect !== 'none') {
    const match = /^(xMin|xMid|xMax)(YMin|YMid|YMax)(?:\s+(meet|slice))?$/.exec(aspect);
    if (!match || match[3] === 'slice') throw new Error('preserveAspectRatio SVG não suportado para corte');
    sx = sy = Math.min(sx, sy);
    const align: Record<string, number> = { xMin: 0, xMid: 0.5, xMax: 1, YMin: 0, YMid: 0.5, YMax: 1 };
    tx = (width - box[2] * sx) * align[match[1]];
    ty = (height - box[3] * sy) * align[match[2]];
  }
  return new Matrix([sx, 0, 0, sy, tx - box[0] * sx, ty - box[1] * sy]);
}

function shape(node: ElementNode): ProcessedSVGElement[] {
  const p = node.properties ?? {};
  const n = (key: string, fallback = 0) => number(p[key], fallback);
  let points: Point[] = [], closed = false;
  const name = node.tagName;
  if (name === 'path') return svgPathElements(String(p.d ?? ''));
  if (name === 'line') points = [{ x: n('x1'), y: n('y1') }, { x: n('x2'), y: n('y2') }];
  else if (name === 'polyline' || name === 'polygon') {
    const values = numbers(String(p.points ?? ''));
    if (values.length % 2) throw new Error('Pares de coordenadas SVG incompletos');
    for (let i = 0; i < values.length; i += 2) points.push({ x: values[i], y: values[i + 1] });
    closed = name === 'polygon';
  } else if (name === 'circle' || name === 'ellipse') {
    const rx = name === 'circle' ? n('r') : n('rx'), ry = name === 'circle' ? rx : n('ry');
    if (rx < 0 || ry < 0) throw new Error('Raio SVG negativo');
    if (rx === 0 || ry === 0) return [];
    return svgPathElements(`M${n('cx') + rx} ${n('cy')} A${rx} ${ry} 0 1 1 ${n('cx') - rx} ${n('cy')} A${rx} ${ry} 0 1 1 ${n('cx') + rx} ${n('cy')} Z`)
      .map(element => ({ ...element, type: name === 'circle' ? SVGElementType.Circle : SVGElementType.Ellipse }));
  } else if (name === 'rect') {
    const x = n('x'), y = n('y'), w = n('width'), h = n('height');
    let rx = n('rx', n('ry')), ry = n('ry', rx);
    if ([w, h, rx, ry].some(value => value < 0)) throw new Error('Dimensão SVG negativa');
    if (w === 0 || h === 0) return [];
    rx = Math.min(rx, w / 2); ry = Math.min(ry, h / 2);
    if (rx > 0 && ry > 0) {
      return svgPathElements(`M${x + rx} ${y} H${x + w - rx} A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}
        V${y + h - ry} A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h} H${x + rx}
        A${rx} ${ry} 0 0 1 ${x} ${y + h - ry} V${y + ry} A${rx} ${ry} 0 0 1 ${x + rx} ${y} Z`)
        .map(element => ({ ...element, type: SVGElementType.Rect }));
    }
    points = [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
    closed = true;
  } else throw new Error(`Elemento SVG não suportado para corte: ${name}`);
  const type = name === 'line' ? SVGElementType.Line : name === 'rect' ? SVGElementType.Rect
    : name === 'polygon' ? SVGElementType.Polygon : SVGElementType.Polyline;
  return [{ type, points, isClosed: closed }];
}

/** Parses SVG geometry, subpaths and nested transforms into millimetre points without a browser DOM. */
export function processSvg(content: string): ProcessedSVGElement[] {
  if (typeof content !== 'string' || !content.trim()) throw new Error('Conteúdo SVG inválido ou vazio');
  const parsed = parse(content);
  const root = parsed.children[0];
  if (root.type !== 'element' || root.tagName !== 'svg') throw new Error('Raiz SVG inválida');
  const elements: ProcessedSVGElement[] = [];
  function visit(node: Node | string, parent: Matrix, isRoot = false): void {
    if (typeof node === 'string' || node.type !== 'element') return;
    if (['defs', 'symbol', 'metadata', 'title', 'desc', 'text'].includes(node.tagName ?? '')) return;
    const p = node.properties ?? {};
    const style = String(p.style ?? '');
    if (p.display === 'none' || p.visibility === 'hidden' ||
        /(?:display\s*:\s*none|visibility\s*:\s*hidden)/.test(style)) return;
    if (p['clip-path'] || p.mask || /(?:transform|clip-path|mask)\s*:/.test(style)) {
      throw new Error('CSS geométrico, máscaras e recortes SVG não suportados; converta em caminhos');
    }
    const matrix = parent.multiply(transformMatrix(String(p.transform ?? '')));
    if (node.tagName === 'svg' && !isRoot) throw new Error('Viewport SVG aninhado não suportado');
    if (!['svg', 'g', 'a'].includes(node.tagName ?? '')) {
      for (const element of shape(node)) {
        elements.push({ ...element, points: element.points.map(point => {
          const mapped = {
            x: matrix.a * point.x + matrix.c * point.y + matrix.e,
            y: matrix.b * point.x + matrix.d * point.y + matrix.f
          };
          calculateDistance(mapped, mapped);
          return mapped;
        }) });
      }
    }
    for (const child of node.children) visit(child, matrix);
  }
  visit(root, viewport(root), true);
  return elements;
}
