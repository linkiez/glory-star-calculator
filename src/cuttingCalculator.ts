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
 * (Implementação aprimorada de otimização)
 */
function optimizeMovements(movements: Movement[]): Movement[] {
  if (movements.length <= 1) {
    return [...movements];
  }

  // Separa movimentos de corte e posicionamento
  const cuttingSegments: Movement[][] = [];
  let currentSegment: Movement[] = [];

  // Agrupa movimentos de corte contínuos OU conectados
  const EPSILON = 0.01;
  for (let i = 0; i < movements.length; i++) {
    if (movements[i].isCutting) {
      if (
        currentSegment.length === 0 ||
        (Math.abs(movements[i].start.x - currentSegment[currentSegment.length - 1].end.x) < EPSILON &&
         Math.abs(movements[i].start.y - currentSegment[currentSegment.length - 1].end.y) < EPSILON)
      ) {
        currentSegment.push(movements[i]);
      } else {
        cuttingSegments.push([...currentSegment]);
        currentSegment = [movements[i]];
      }
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
      if (segment.length > 1) { // só faz sentido inverter se houver mais de um movimento
        const lastMovement = segment[segment.length - 1];
        const distToEnd = calculateDistance(currentPoint, lastMovement.end);
        if (distToEnd < minDistance) {
          minDistance = distToEnd;
          closestSegmentIndex = i;
          useReverseOrder = true;
        }
      }
    }

    // Adiciona movimento de posicionamento para o próximo segmento, se necessário
    const segment = cuttingSegments[closestSegmentIndex];
    let segmentStart: Point, segmentEnd: Point;
    if (useReverseOrder && segment.length > 1) {
      segmentStart = segment[segment.length - 1].end;
      segmentEnd = segment[0].start;
    } else {
      segmentStart = segment[0].start;
      segmentEnd = segment[segment.length - 1].end;
    }
    // Só adiciona movimento de posicionamento se não estiver já conectado
    if (currentPoint.x !== segmentStart.x || currentPoint.y !== segmentStart.y) {
      optimizedMovements.push({
        start: currentPoint,
        end: segmentStart,
        isCutting: false
      });
    }

    // Adiciona os movimentos de corte
    if (useReverseOrder && segment.length > 1) {
      for (let i = segment.length - 1; i >= 0; i--) {
        optimizedMovements.push({
          start: segment[i].end,
          end: segment[i].start,
          isCutting: true
        });
      }
      currentPoint = segment[0].start;
    } else {
      optimizedMovements.push(...segment);
      currentPoint = segment[segment.length - 1].end;
    }

    // Remove o segmento processado
    cuttingSegments.splice(closestSegmentIndex, 1);
  }

  // Remove movimento de posicionamento inicial se for desnecessário
  if (optimizedMovements.length > 0 && !optimizedMovements[0].isCutting &&
      optimizedMovements[1] && optimizedMovements[0].end.x === optimizedMovements[1].start.x && optimizedMovements[0].end.y === optimizedMovements[1].start.y) {
    optimizedMovements.shift();
  }

  return optimizedMovements;
}

/**
 * Função utilitária para inserir movimentos de posicionamento entre segmentos desconectados
 */
function insertPositioningMovements(movements: Movement[]): Movement[] {
  if (movements.length === 0) return [];
  const EPSILON = 0.01;
  const result: Movement[] = [movements[0]];
  for (let i = 1; i < movements.length; i++) {
    const prev = result[result.length - 1];
    const curr = movements[i];
    if (
      Math.abs(prev.end.x - curr.start.x) > EPSILON ||
      Math.abs(prev.end.y - curr.start.y) > EPSILON
    ) {
      result.push({
        start: prev.end,
        end: curr.start,
        isCutting: false
      });
    }
    result.push(curr);
  }
  return result;
}

/**
 * Função utilitária para normalizar movimentos para a origem
 */
function normalizeMovementsToOrigin(movements: Movement[]): Movement[] {
  if (movements.length === 0) return movements;
  let minX = Infinity, minY = Infinity;
  for (const m of movements) {
    minX = Math.min(minX, m.start.x, m.end.x);
    minY = Math.min(minY, m.start.y, m.end.y);
  }
  // Se já está na origem, não faz nada
  if (Math.abs(minX) < 1e-6 && Math.abs(minY) < 1e-6) return movements;
  return movements.map(m => ({
    ...m,
    start: { x: m.start.x - minX, y: m.start.y - minY },
    end: { x: m.end.x - minX, y: m.end.y - minY }
  }));
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
  
  // Determina o kerf a ser usado
  let kerf = options.kerf;
  if (kerf === undefined || kerf === null) {
    // Busca kerf padrão para a espessura
    // @ts-ignore
    const { KERF_DISTANCE } = require('./constants');
    kerf = KERF_DISTANCE[options.materialThickness] ?? 0;
  }
  kerf = Number(kerf) || 0;
  
  // Otimiza os movimentos se a opção estiver habilitada
  let processedMovements = movements;
  if (options.optimize) {
    // Normaliza para origem antes de otimizar
    processedMovements = optimizeMovements(normalizeMovementsToOrigin(insertPositioningMovements(movements)));
  } else {
    processedMovements = movements;
  }
  
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
    
    // Aplica kerf apenas para movimentos de corte
    if (isCutting && kerf > 0 && options.materialThickness > 0) {
      distance *= (1 + kerf / options.materialThickness);
    }
    
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

  // Calcula bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of elements) {
    for (const pt of el.points) {
      minX = Math.min(minX, pt.x); minY = Math.min(minY, pt.y);
      maxX = Math.max(maxX, pt.x); maxY = Math.max(maxY, pt.y);
    }
  }

  // Calcula o tempo de corte
  const result = calculateCuttingTime(movements, options);
  if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
    result.cutAreaWidth = maxX - minX;
    result.cutAreaHeight = maxY - minY;
  }
  return result;
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
  const entityTypes: Record<string, number> = {};
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  if (!dxf || !dxf.entities) return calculateCuttingTime([], options);
  for (const entity of dxf.entities) {
    entityTypes[entity.type] = (entityTypes[entity.type] || 0) + 1;
    let entityMinX = Infinity, entityMinY = Infinity, entityMaxX = -Infinity, entityMaxY = -Infinity;
    if (entity.type === 'INSERT' && dxf.blocks && dxf.blocks[entity.name]) {
      // Expande o bloco
      const block = dxf.blocks[entity.name];
      const insertX = entity.x || 0;
      const insertY = entity.y || 0;
      for (const blockEntity of block.entities) {
        // Cria uma cópia da entidade com deslocamento
        const e = JSON.parse(JSON.stringify(blockEntity));
        // Aplica deslocamento para entidades com pontos
        if (e.x !== undefined && e.y !== undefined) {
          e.x += insertX;
          e.y += insertY;
        }
        if (e.center) {
          e.center.x += insertX;
          e.center.y += insertY;
        }
        if (e.vertices) {
          for (const v of e.vertices) {
            v.x += insertX;
            v.y += insertY;
          }
        }
        // Processa a entidade expandida como se fosse do topo
        dxf.entities.push(e);
      }
      continue;
    }
    if (entity.type === 'LINE') {
      if (entity.vertices && entity.vertices.length === 2) {
        movements.push({
          start: { x: entity.vertices[0].x, y: entity.vertices[0].y },
          end: { x: entity.vertices[1].x, y: entity.vertices[1].y },
          isCutting: true
        });
        [entity.vertices[0], entity.vertices[1]].forEach((pt: any) => {
          entityMinX = Math.min(entityMinX, pt.x);
          entityMinY = Math.min(entityMinY, pt.y);
          entityMaxX = Math.max(entityMaxX, pt.x);
          entityMaxY = Math.max(entityMaxY, pt.y);
        });
      } else {
        movements.push({
          start: { x: entity.x1, y: entity.y1 },
          end: { x: entity.x2, y: entity.y2 },
          isCutting: true
        });
        [
          { x: entity.x1, y: entity.y1 },
          { x: entity.x2, y: entity.y2 }
        ].forEach((pt) => {
          entityMinX = Math.min(entityMinX, pt.x);
          entityMinY = Math.min(entityMinY, pt.y);
          entityMaxX = Math.max(entityMaxX, pt.x);
          entityMaxY = Math.max(entityMaxY, pt.y);
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
      entityMinX = circle.center.x - circle.radius;
      entityMaxX = circle.center.x + circle.radius;
      entityMinY = circle.center.y - circle.radius;
      entityMaxY = circle.center.y + circle.radius;
    }
    if (entity.type === 'ARC') {
      const arc = entity as any;
      const steps = 24;
      const startAngle = (arc.startAngle * Math.PI) / 180;
      const endAngle = (arc.endAngle * Math.PI) / 180;
      let sweep = endAngle - startAngle;
      if (sweep <= 0) sweep += 2 * Math.PI;
      let arcMinX = Infinity, arcMaxX = -Infinity, arcMinY = Infinity, arcMaxY = -Infinity;
      for (let i = 0; i < steps; i++) {
        const a1 = startAngle + (sweep * i) / steps;
        const a2 = startAngle + (sweep * (i + 1)) / steps;
        const pt1 = {
          x: arc.center.x + arc.radius * Math.cos(a1),
          y: arc.center.y + arc.radius * Math.sin(a1)
        };
        const pt2 = {
          x: arc.center.x + arc.radius * Math.cos(a2),
          y: arc.center.y + arc.radius * Math.sin(a2)
        };
        movements.push({ start: pt1, end: pt2, isCutting: true });
        [pt1, pt2].forEach((pt) => {
          arcMinX = Math.min(arcMinX, pt.x); arcMinY = Math.min(arcMinY, pt.y);
          arcMaxX = Math.max(arcMaxX, pt.x); arcMaxY = Math.max(arcMaxY, pt.y);
        });
      }
      // Envelope total do arco (círculo completo)
      arcMinX = Math.min(arcMinX, arc.center.x - arc.radius);
      arcMaxX = Math.max(arcMaxX, arc.center.x + arc.radius);
      arcMinY = Math.min(arcMinY, arc.center.y - arc.radius);
      arcMaxY = Math.max(arcMaxY, arc.center.y + arc.radius);
      entityMinX = arcMinX;
      entityMaxX = arcMaxX;
      entityMinY = arcMinY;
      entityMaxY = arcMaxY;
    }
    if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
      const poly = entity as any;
      for (let i = 0; i < poly.vertices.length - 1; i++) {
        movements.push({
          start: { x: poly.vertices[i].x, y: poly.vertices[i].y },
          end: { x: poly.vertices[i + 1].x, y: poly.vertices[i + 1].y },
          isCutting: true
        });
        [poly.vertices[i], poly.vertices[i + 1]].forEach((pt: any) => {
          entityMinX = Math.min(entityMinX, pt.x);
          entityMinY = Math.min(entityMinY, pt.y);
          entityMaxX = Math.max(entityMaxX, pt.x);
          entityMaxY = Math.max(entityMaxY, pt.y);
        });
      }
      if (poly.closed) {
        movements.push({
          start: { x: poly.vertices[poly.vertices.length - 1].x, y: poly.vertices[poly.vertices.length - 1].y },
          end: { x: poly.vertices[0].x, y: poly.vertices[0].y },
          isCutting: true
        });
        [poly.vertices[poly.vertices.length - 1], poly.vertices[0]].forEach((pt: any) => {
          entityMinX = Math.min(entityMinX, pt.x);
          entityMinY = Math.min(entityMinY, pt.y);
          entityMaxX = Math.max(entityMaxX, pt.x);
          entityMaxY = Math.max(entityMaxY, pt.y);
        });
      }
    }
    // Atualiza o bounding box global
    minX = Math.min(minX, entityMinX);
    minY = Math.min(minY, entityMinY);
    maxX = Math.max(maxX, entityMaxX);
    maxY = Math.max(maxY, entityMaxY);
  }
  // Normaliza movimentos para enquadrar o desenho na origem
  const normalizedMovements = normalizeMovementsToOrigin(movements);
  console.log('Tipos de entidades encontrados no DXF:', entityTypes);
  console.log('Bounding box DXF: minX=', minX, 'maxX=', maxX, 'minY=', minY, 'maxY=', maxY, 'Largura:', maxX - minX, 'Altura:', maxY - minY);
  const result = calculateCuttingTime(normalizedMovements, options);
  if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
    result.cutAreaWidth = maxX - minX;
    result.cutAreaHeight = maxY - minY;
  }
  return result;
}