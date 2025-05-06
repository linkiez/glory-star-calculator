/**
 * Tipos e interfaces para o cálculo de tempo de corte
 */

// Representa um ponto no espaço 2D
export interface Point {
  x: number;
  y: number;
}

// Representa um movimento de corte ou posicionamento
export interface Movement {
  start: Point;
  end: Point;
  isCutting: boolean;
}

// Tipo de elemento SVG suportado
export enum SVGElementType {
  Line = 'line',
  Polyline = 'polyline',
  Polygon = 'polygon',
  Path = 'path',
  Circle = 'circle',
  Ellipse = 'ellipse',
  Rect = 'rect'
}

// Representa um elemento SVG processado
export interface ProcessedSVGElement {
  type: SVGElementType;
  points: Point[];
  isClosed: boolean;
}

// Resultado do cálculo de tempo
export interface CuttingTimeResult {
  totalTimeSec: number;
  cuttingTimeSec: number;
  movementTimeSec: number;
  piercingTimeSec: number;
  setupTimeSec: number;
  totalDistance: number;
  cuttingDistance: number;
  movementDistance: number;
  pierceCount: number;
  partCount: number;
}

// Opções para o cálculo do tempo de corte
export interface CuttingTimeOptions {
  materialThickness: number;
  kerf?: number;
  leadIn?: number;
  leadOut?: number;
  piercingType?: 'normal' | 'flying';
  optimize?: boolean;
}