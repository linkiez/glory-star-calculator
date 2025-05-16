import DxfParser from 'dxf-parser';
import {
  ACCELERATION_TIME,
  CUTTING_SPEEDS,
  MAX_DISTANCE_FOR_HEAD_DOWN,
  MAX_DISTANCE_FOR_JUMP,
  MIN_DISTANCE_FOR_ACCELERATION,
  PIERCE_TIMES,
  RAPID_SPEED,
  SETUP_TIME
} from './constants';
import { convertElementsToMovements, processSvg } from './svgProcessor';
import {
  CuttingTimeOptions,
  CuttingTimeResult,
  Movement,
  Point
} from './types';

/**
 * Calcula a distância euclidiana entre dois pontos
 */
export function calculateDistance(point1: Point, point2: Point): number {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + 
    Math.pow(point2.y - point1.y, 2)
  );
}

/**
 * Obtém a velocidade de corte para uma determinada espessura de material
 */
export function getCuttingSpeed(thickness: number): number {
  // Encontra os valores de espessura disponíveis na tabela
  const thicknesses = Object.keys(CUTTING_SPEEDS).map(Number).sort((a, b) => a - b);
  
  // Se tivermos uma correspondência exata, retorna o valor
  if (CUTTING_SPEEDS[thickness] !== undefined) {
    return CUTTING_SPEEDS[thickness];
  }
  
  // Espessura menor que a mínima disponível
  if (thickness < thicknesses[0]) {
    return CUTTING_SPEEDS[thicknesses[0]];
  }
  
  // Espessura maior que a máxima disponível
  if (thickness > thicknesses[thicknesses.length - 1]) {
    return CUTTING_SPEEDS[thicknesses[thicknesses.length - 1]];
  }
  
  // Interpolação linear entre os valores mais próximos
  for (let i = 0; i < thicknesses.length - 1; i++) {
    if (thickness > thicknesses[i] && thickness < thicknesses[i + 1]) {
      const lowerThickness = thicknesses[i];
      const upperThickness = thicknesses[i + 1];
      const lowerSpeed = CUTTING_SPEEDS[lowerThickness];
      const upperSpeed = CUTTING_SPEEDS[upperThickness];
      
      // Cálculo da interpolação linear
      const ratio = (thickness - lowerThickness) / (upperThickness - lowerThickness);
      return lowerSpeed - ratio * (lowerSpeed - upperSpeed);
    }
  }
  
  // Se por algum motivo não encontrou (não deveria ocorrer), retorna o valor para espessura mais próxima
  const closestThickness = thicknesses.reduce((prev, curr) => 
    Math.abs(curr - thickness) < Math.abs(prev - thickness) ? curr : prev
  );
  return CUTTING_SPEEDS[closestThickness];
}

/**
 * Obtém o tempo de perfuração para uma determinada espessura de material
 */
export function getPierceTime(thickness: number): number {
  // Encontra os valores de espessura disponíveis na tabela
  const thicknesses = Object.keys(PIERCE_TIMES).map(Number).sort((a, b) => a - b);
  
  if (PIERCE_TIMES[thickness] !== undefined) {
    return PIERCE_TIMES[thickness];
  }
  
  // Espessura menor que a mínima disponível
  if (thickness < thicknesses[0]) {
    return PIERCE_TIMES[thicknesses[0]];
  }
  
  // Espessura maior que a máxima disponível
  if (thickness > thicknesses[thicknesses.length - 1]) {
    return PIERCE_TIMES[thicknesses[thicknesses.length - 1]];
  }
  
  // Interpolação linear entre os valores mais próximos
  for (let i = 0; i < thicknesses.length - 1; i++) {
    if (thickness > thicknesses[i] && thickness < thicknesses[i + 1]) {
      const lowerThickness = thicknesses[i];
      const upperThickness = thicknesses[i + 1];
      const lowerTime = PIERCE_TIMES[lowerThickness];
      const upperTime = PIERCE_TIMES[upperThickness];
      
      // Cálculo da interpolação linear
      const ratio = (thickness - lowerThickness) / (upperThickness - lowerThickness);
      return lowerTime + ratio * (upperTime - lowerTime);
    }
  }
  
  // Se por algum motivo não encontrou (não deveria ocorrer), retorna o valor para espessura mais próxima
  const closestThickness = thicknesses.reduce((prev, curr) => 
    Math.abs(curr - thickness) < Math.abs(prev - thickness) ? curr : prev
  );
  return PIERCE_TIMES[closestThickness];
}

/**
 * Calcula o tempo de movimento baseado na distância e velocidade
 */
function calculateMovementTime(distance: number, speed: number): number {
  if (distance <= 0 || speed <= 0) {
    return 0;
  }
  
  // Garante que não estamos usando valores NaN ou Infinity
  if (isNaN(distance) || !isFinite(distance) || isNaN(speed) || !isFinite(speed)) {
    return 0;
  }
  
  // Converte velocidade de mm/min para mm/s
  const speedInMmPerSec = speed / 60;
  
  // Se a distância for muito pequena, não considera aceleração
  if (distance < MIN_DISTANCE_FOR_ACCELERATION) {
    return distance / speedInMmPerSec;
  }
  
  // Considera aceleração e desaceleração
  return distance / speedInMmPerSec + ACCELERATION_TIME;
}

/**
 * Determina se um movimento deve ser feito com o cabeçote abaixado
 */
function shouldMoveWithHeadDown(distance: number): boolean {
  return distance <= MAX_DISTANCE_FOR_HEAD_DOWN;
}

/**
 * Determina se um movimento deve ser feito como um salto (jump)
 */
function shouldJump(distance: number): boolean {
  return distance <= MAX_DISTANCE_FOR_JUMP && distance > MAX_DISTANCE_FOR_HEAD_DOWN;
}

/**
 * Calcula o tempo para um movimento específico
 */
function calculateTimeForMovement(movement: Movement, cuttingSpeed: number): {
  time: number;
  distance: number;
  isCutting: boolean;
} {
  const distance = calculateDistance(movement.start, movement.end);
  
  // Garante que não estamos lidando com valores inválidos
  if (isNaN(distance) || !isFinite(distance)) {
    return { time: 0, distance: 0, isCutting: movement.isCutting };
  }
  
  if (movement.isCutting) {
    // Movimento de corte
    const time = calculateMovementTime(distance, cuttingSpeed);
    return { time, distance, isCutting: true };
  } else {
    // Movimento de posicionamento
    let speed = RAPID_SPEED;
    
    if (shouldMoveWithHeadDown(distance)) {
      // Movimento curto com cabeçote abaixado
      speed = RAPID_SPEED * 0.8; // 80% da velocidade rápida
    } else if (shouldJump(distance)) {
      // Movimento médio com salto
      speed = RAPID_SPEED * 0.9; // 90% da velocidade rápida
    }
    
    const time = calculateMovementTime(distance, speed);
    return { time, distance, isCutting: false };
  }
}

/**
 * Otimiza o caminho de corte para minimizar movimentos
 * (Implementação básica de otimização gulosa)
 */
function optimizeMovements(movements: Movement[]): Movement[] {
  if (movements.length <= 1) {
    return [...movements];
  }
  
  // Separa movimentos de corte e posicionamento
  const cuttingSegments: Movement[][] = [];
  let currentSegment: Movement[] = [];
  
  // Agrupa movimentos de corte contínuos
  for (let i = 0; i < movements.length; i++) {
    if (movements[i].isCutting) {
      currentSegment.push(movements[i]);
    } else if (currentSegment.length > 0) {
      cuttingSegments.push([...currentSegment]);
      currentSegment = [];
    }
  }
  
  if (currentSegment.length > 0) {
    cuttingSegments.push([...currentSegment]);
  }
  
  // Se não há segmentos de corte, retorna os movimentos originais
  if (cuttingSegments.length === 0) {
    return [...movements];
  }
  
  // Reorganiza os segmentos para minimizar movimentos
  const optimizedMovements: Movement[] = [];
  let currentPoint: Point = { x: 0, y: 0 }; // Ponto inicial
  
  while (cuttingSegments.length > 0) {
    // Encontra o segmento mais próximo do ponto atual
    let closestSegmentIndex = 0;
    let minDistance = Infinity;
    let useReverseOrder = false;
    
    for (let i = 0; i < cuttingSegments.length; i++) {
      const segment = cuttingSegments[i];
      
      // Distância até o primeiro ponto do segmento
      const distToStart = calculateDistance(currentPoint, segment[0].start);
      if (distToStart < minDistance) {
        minDistance = distToStart;
        closestSegmentIndex = i;
        useReverseOrder = false;
      }
      
      // Distância até o último ponto do segmento (segmento invertido)
      const lastMovement = segment[segment.length - 1];
      const distToEnd = calculateDistance(currentPoint, lastMovement.end);
      if (distToEnd < minDistance) {
        minDistance = distToEnd;
        closestSegmentIndex = i;
        useReverseOrder = true;
      }
    }
    
    // Adiciona movimento de posicionamento para o próximo segmento
    const segment = cuttingSegments[closestSegmentIndex];
    
    if (useReverseOrder) {
      // Inverte o segmento se for mais eficiente
      const lastMovement = segment[segment.length - 1];
      
      optimizedMovements.push({
        start: currentPoint,
        end: lastMovement.end,
        isCutting: false
      });
      
      // Adiciona os movimentos de corte em ordem inversa
      for (let i = segment.length - 1; i >= 0; i--) {
        const movement = segment[i];
        optimizedMovements.push({
          start: movement.end,
          end: movement.start,
          isCutting: true
        });
      }
      
      currentPoint = segment[0].start;
    } else {
      optimizedMovements.push({
        start: currentPoint,
        end: segment[0].start,
        isCutting: false
      });
      
      // Adiciona os movimentos de corte na ordem original
      optimizedMovements.push(...segment);
      
      currentPoint = segment[segment.length - 1].end;
    }
    
    // Remove o segmento processado
    cuttingSegments.splice(closestSegmentIndex, 1);
  }
  
  return optimizedMovements;
}

/**
 * Calcula o tempo de corte a partir de uma lista de movimentos
 */
export function calculateCuttingTime(
  movements: Movement[],
  options: CuttingTimeOptions
): CuttingTimeResult {
  // Valores iniciais para o resultado
  const result: CuttingTimeResult = {
    totalTimeSec: 0,
    cuttingTimeSec: 0,
    movementTimeSec: 0,
    piercingTimeSec: 0,
    setupTimeSec: 0,
    totalDistance: 0,
    cuttingDistance: 0,
    movementDistance: 0,
    pierceCount: 0,
    partCount: 0
  };
  
  if (movements.length === 0) {
    return result;
  }
  
  const scale = options.scaleFactor ?? 1;
  
  // Otimiza os movimentos se a opção estiver habilitada
  const processedMovements = options.optimize ? 
    optimizeMovements(movements) : movements;
  
  // Obtém a velocidade de corte baseada na espessura do material
  const cuttingSpeed = getCuttingSpeed(options.materialThickness);
  
  // Obtém o tempo de perfuração
  const pierceTime = getPierceTime(options.materialThickness);
  
  // Flag para rastrear se estamos em um segmento de corte contínuo
  let inCuttingSegment = false;
  
  // Processa cada movimento
  processedMovements.forEach(movement => {
    let { time, distance, isCutting } = calculateTimeForMovement(movement, cuttingSpeed);
    distance *= scale;
    time *= scale;
    
    // Acumula distâncias
    result.totalDistance += distance;
    
    if (isCutting) {
      result.cuttingDistance += distance;
      result.cuttingTimeSec += time;
      
      // Se não estávamos cortando antes, adiciona tempo de perfuração
      if (!inCuttingSegment) {
        result.pierceCount++;
        result.piercingTimeSec += pierceTime;
        inCuttingSegment = true;
      }
    } else {
      result.movementDistance += distance;
      result.movementTimeSec += time;
      inCuttingSegment = false;
    }
  });
  
  // Conta o número de peças (cada "true" seguido de "false" na sequência de isCutting)
  result.partCount = result.pierceCount;
  
  // Adiciona tempo de setup
  result.setupTimeSec = SETUP_TIME * result.partCount;
  
  // Calcula tempo total
  result.totalTimeSec = 
    result.cuttingTimeSec + 
    result.movementTimeSec + 
    result.piercingTimeSec + 
    result.setupTimeSec;
  
  return result;
}

/**
 * Função principal que calcula o tempo de corte a partir de um arquivo SVG
 */
export function calculateCuttingTimeFromSvg(
  svgContent: string,
  options: CuttingTimeOptions
): CuttingTimeResult {
  // Processa o SVG para extrair elementos
  const elements = processSvg(svgContent);
  
  // Converte os elementos em movimentos
  const movements = convertElementsToMovements(elements);
  
  // Calcula o tempo de corte
  return calculateCuttingTime(movements, options);
}

/**
 * Função principal que calcula o tempo de corte a partir de um arquivo DXF
 */
export function calculateCuttingTimeFromDxf(dxfString: string, options: CuttingTimeOptions): CuttingTimeResult {
  const parser = new DxfParser();
  let dxf: any;
  try {
    dxf = parser.parseSync(dxfString);
  } catch (e) {
    throw new Error('Erro ao fazer o parse do DXF: ' + e);
  }
  const movements: Movement[] = [];
  if (!dxf || !dxf.entities) return calculateCuttingTime([], options);
  for (const entity of dxf.entities) {
    if (entity.type === 'LINE') {
      // Suporte para DXF que retorna vertices ao invés de x1/y1/x2/y2
      if (entity.vertices && entity.vertices.length === 2) {
        movements.push({
          start: { x: entity.vertices[0].x, y: entity.vertices[0].y },
          end: { x: entity.vertices[1].x, y: entity.vertices[1].y },
          isCutting: true
        });
      } else {
        movements.push({
          start: { x: entity.x1, y: entity.y1 },
          end: { x: entity.x2, y: entity.y2 },
          isCutting: true
        });
      }
    }
    if (entity.type === 'CIRCLE') {
      const circle = entity as any;
      const steps = 32;
      const points: Point[] = [];
      for (let i = 0; i < steps; i++) {
        const angle = (2 * Math.PI * i) / steps;
        points.push({
          x: circle.center.x + circle.radius * Math.cos(angle),
          y: circle.center.y + circle.radius * Math.sin(angle)
        });
      }
      for (let i = 0; i < steps; i++) {
        movements.push({
          start: points[i],
          end: points[(i + 1) % steps],
          isCutting: true
        });
      }
    }
    if (entity.type === 'ARC') {
      const arc = entity as any;
      const steps = 24;
      const startAngle = (arc.startAngle * Math.PI) / 180;
      const endAngle = (arc.endAngle * Math.PI) / 180;
      const sweep = endAngle > startAngle ? endAngle - startAngle : 2 * Math.PI - (startAngle - endAngle);
      for (let i = 0; i < steps; i++) {
        const a1 = startAngle + (sweep * i) / steps;
        const a2 = startAngle + (sweep * (i + 1)) / steps;
        movements.push({
          start: {
            x: arc.center.x + arc.radius * Math.cos(a1),
            y: arc.center.y + arc.radius * Math.sin(a1)
          },
          end: {
            x: arc.center.x + arc.radius * Math.cos(a2),
            y: arc.center.y + arc.radius * Math.sin(a2)
          },
          isCutting: true
        });
      }
    }
    if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
      const poly = entity as any;
      for (let i = 0; i < poly.vertices.length - 1; i++) {
        movements.push({
          start: { x: poly.vertices[i].x, y: poly.vertices[i].y },
          end: { x: poly.vertices[i + 1].x, y: poly.vertices[i + 1].y },
          isCutting: true
        });
      }
      if (poly.closed) {
        movements.push({
          start: { x: poly.vertices[poly.vertices.length - 1].x, y: poly.vertices[poly.vertices.length - 1].y },
          end: { x: poly.vertices[0].x, y: poly.vertices[0].y },
          isCutting: true
        });
      }
    }
  }
  return calculateCuttingTime(movements, options);
}