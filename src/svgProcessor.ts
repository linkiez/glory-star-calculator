import { parse } from 'svg-parser';
import {
  Movement,
  Point,
  ProcessedSVGElement,
  SVGElementType
} from './types';

/**
 * Processa uma string SVG e extrai os elementos
 * @param svgContent Conteúdo do SVG em string
 * @returns Array de elementos SVG processados
 */
export function processSvg(svgContent: string): ProcessedSVGElement[] {
  try {
    // Validação básica se a entrada parece ser um SVG
    if (!svgContent || typeof svgContent !== 'string') {
      throw new Error('Conteúdo SVG inválido ou vazio');
    }
    
    // Verificação simplificada se o conteúdo contém pelo menos uma tag SVG
    if (!svgContent.includes('<svg') || !svgContent.includes('>')) {
      throw new Error('Conteúdo não parece ser um SVG válido');
    }
    
    const parsed = parse(svgContent);
    
    // Verifica se o parser retornou algo utilizável
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Falha ao processar SVG: resultado de parsing inválido');
    }
    
    const elements: ProcessedSVGElement[] = [];
    
    // Função recursiva para processar nós SVG
    function processNode(node: any) {
      if (node.type === 'element') {
        const element = processElement(node);
        if (element) {
          elements.push(element);
        }
      }
      
      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          processNode(child);
        }
      }
    }
    
    // Inicia o processamento recursivo
    processNode(parsed);
    
    return elements;
  } catch (error) {
    throw new Error(`Erro ao processar o SVG: ${error}`);
  }
}

/**
 * Processa um elemento SVG
 * @param element Elemento SVG do parser
 * @returns Elemento SVG processado
 */
function processElement(element: any): ProcessedSVGElement | null {
  switch (element.tagName) {
    case 'line':
      return processLine(element);
    case 'polyline':
      return processPolyline(element);
    case 'polygon':
      return processPolygon(element);
    case 'path':
      return processPath(element);
    case 'circle':
      return processCircle(element);
    case 'rect':
      return processRect(element);
    case 'ellipse':
      return processEllipse(element);
    default:
      return null;
  }
}

/**
 * Processa uma linha SVG
 */
function processLine(element: any): ProcessedSVGElement {
  const { x1, y1, x2, y2 } = element.properties;
  
  return {
    type: SVGElementType.Line,
    points: [
      { x: parseFloat(x1), y: parseFloat(y1) },
      { x: parseFloat(x2), y: parseFloat(y2) }
    ],
    isClosed: false
  };
}

/**
 * Processa uma polilinha SVG
 */
function processPolyline(element: any): ProcessedSVGElement {
  const points = parsePointsString(element.properties.points);
  
  return {
    type: SVGElementType.Polyline,
    points,
    isClosed: false
  };
}

/**
 * Processa um polígono SVG
 */
function processPolygon(element: any): ProcessedSVGElement {
  const points = parsePointsString(element.properties.points);
  
  return {
    type: SVGElementType.Polygon,
    points,
    isClosed: true
  };
}

/**
 * Processa um path SVG
 */
function processPath(element: any): ProcessedSVGElement {
  // Implementação simplificada - em um caso real, precisaríamos de um parser completo de SVG path
  // Esta é apenas uma demonstração e deve ser substituída por uma solução robusta
  const d = element.properties.d || '';
  const points: Point[] = [];
  
  // Implementação básica para demonstração
  // Apenas extrai coordenadas simples de comandos M, L, H, V
  const commands = d.match(/[MLHVZmlhvz][^MLHVZmlhvz]*/g) || [];
  let currentPoint = { x: 0, y: 0 };
  
  commands.forEach((cmd: string) => {
    const type = cmd[0];
    const argsStr = cmd.slice(1).trim();
    const args = argsStr ? argsStr.split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n)) : [];
    
    switch (type) {
      case 'M': // Move to
        if (args.length >= 2) {
          currentPoint = { x: args[0], y: args[1] };
          points.push({ ...currentPoint });
          
          // Se houver coordenadas adicionais após M, elas são tratadas como L
          for (let i = 2; i < args.length; i += 2) {
            if (i + 1 < args.length) {
              currentPoint = { x: args[i], y: args[i + 1] };
              points.push({ ...currentPoint });
            }
          }
        }
        break;
      case 'L': // Line to
        for (let i = 0; i < args.length; i += 2) {
          if (i + 1 < args.length) {
            currentPoint = { x: args[i], y: args[i + 1] };
            points.push({ ...currentPoint });
          }
        }
        break;
      case 'H': // Horizontal line
        for (const x of args) {
          currentPoint = { x, y: currentPoint.y };
          points.push({ ...currentPoint });
        }
        break;
      case 'V': // Vertical line
        for (const y of args) {
          currentPoint = { x: currentPoint.x, y };
          points.push({ ...currentPoint });
        }
        break;
      case 'Z': // Close path
      case 'z':
        if (points.length > 0) {
          // Adiciona o ponto inicial para fechar o caminho
          points.push({ ...points[0] });
        }
        break;
    }
  });
  
  return {
    type: SVGElementType.Path,
    points,
    isClosed: d.toUpperCase().includes('Z')
  };
}

/**
 * Processa um círculo SVG convertendo-o para uma aproximação poligonal
 */
function processCircle(element: any): ProcessedSVGElement {
  const cx = parseFloat(element.properties.cx || 0);
  const cy = parseFloat(element.properties.cy || 0);
  const r = parseFloat(element.properties.r || 0);
  
  // Cria uma aproximação do círculo com pontos
  const points = approximateCircle(cx, cy, r);
  
  return {
    type: SVGElementType.Circle,
    points,
    isClosed: true
  };
}

/**
 * Processa uma elipse SVG convertendo-a para uma aproximação poligonal
 */
function processEllipse(element: any): ProcessedSVGElement {
  const cx = parseFloat(element.properties.cx || 0);
  const cy = parseFloat(element.properties.cy || 0);
  const rx = parseFloat(element.properties.rx || 0);
  const ry = parseFloat(element.properties.ry || rx); // Se apenas rx for especificado
  
  // Cria uma aproximação da elipse com pontos
  const points = approximateEllipse(cx, cy, rx, ry);
  
  return {
    type: SVGElementType.Ellipse,
    points,
    isClosed: true
  };
}

/**
 * Processa um retângulo SVG
 */
function processRect(element: any): ProcessedSVGElement {
  const x = parseFloat(element.properties.x || 0);
  const y = parseFloat(element.properties.y || 0);
  const width = parseFloat(element.properties.width || 0);
  const height = parseFloat(element.properties.height || 0);
  const rx = parseFloat(element.properties.rx || 0);
  const ry = parseFloat(element.properties.ry || rx); // Se apenas rx for especificado
  
  let points: Point[];
  
  if (rx > 0 || ry > 0) {
    // Retângulo com cantos arredondados
    points = approximateRoundedRect(x, y, width, height, rx, ry);
  } else {
    // Retângulo regular
    points = [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
      { x, y } // Fecha o caminho
    ];
  }
  
  return {
    type: SVGElementType.Rect,
    points,
    isClosed: true
  };
}

/**
 * Analisa uma string de pontos SVG
 */
function parsePointsString(pointsString: string): Point[] {
  if (!pointsString) return [];
  
  // Divide a string em pares de coordenadas
  const pairs = pointsString.trim().split(/[\s,]+/);
  const points: Point[] = [];
  
  for (let i = 0; i < pairs.length; i += 2) {
    if (i + 1 < pairs.length) {
      const x = parseFloat(pairs[i]);
      const y = parseFloat(pairs[i + 1]);
      if (!isNaN(x) && !isNaN(y)) {
        points.push({ x, y });
      }
    }
  }
  
  return points;
}

/**
 * Cria uma aproximação de um círculo como uma série de pontos
 */
function approximateCircle(cx: number, cy: number, r: number, segments = 36): Point[] {
  const points: Point[] = [];
  const angleStep = (2 * Math.PI) / segments;
  
  for (let i = 0; i <= segments; i++) {
    const angle = i * angleStep;
    points.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    });
  }
  
  return points;
}

/**
 * Cria uma aproximação de uma elipse como uma série de pontos
 */
function approximateEllipse(cx: number, cy: number, rx: number, ry: number, segments = 36): Point[] {
  const points: Point[] = [];
  const angleStep = (2 * Math.PI) / segments;
  
  for (let i = 0; i <= segments; i++) {
    const angle = i * angleStep;
    points.push({
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle)
    });
  }
  
  return points;
}

/**
 * Cria uma aproximação de um retângulo com cantos arredondados
 */
function approximateRoundedRect(x: number, y: number, width: number, height: number, rx: number, ry: number): Point[] {
  // Limitar os raios aos limites do retângulo
  rx = Math.min(rx, width / 2);
  ry = Math.min(ry, height / 2);
  
  const points: Point[] = [];
  const segments = 8; // Segmentos por canto
  
  // Função auxiliar para adicionar um arco
  function addArc(centerX: number, centerY: number, startAngle: number, endAngle: number): void {
    const angleStep = (endAngle - startAngle) / segments;
    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + i * angleStep;
      points.push({
        x: centerX + rx * Math.cos(angle),
        y: centerY + ry * Math.sin(angle)
      });
    }
  }
  
  // Canto superior direito
  addArc(x + width - rx, y + ry, -Math.PI / 2, 0);
  
  // Canto inferior direito
  addArc(x + width - rx, y + height - ry, 0, Math.PI / 2);
  
  // Canto inferior esquerdo
  addArc(x + rx, y + height - ry, Math.PI / 2, Math.PI);
  
  // Canto superior esquerdo
  addArc(x + rx, y + ry, Math.PI, 3 * Math.PI / 2);
  
  // Fecha o caminho adicionando o primeiro ponto novamente
  points.push({...points[0]});
  
  return points;
}

/**
 * Converte elementos SVG processados em movimentos
 * @param elements Elementos SVG processados
 * @returns Lista de movimentos
 */
export function convertElementsToMovements(elements: ProcessedSVGElement[]): Movement[] {
  const movements: Movement[] = [];
  
  if (elements.length === 0) {
    return movements;
  }
  
  let currentPosition: Point = { x: 0, y: 0 };
  
  elements.forEach(element => {
    const points = element.points;
    
    if (points.length === 0) {
      return; // Pula elementos sem pontos
    }
    
    // Movimento de posicionamento até o primeiro ponto do elemento
    movements.push({
      start: currentPosition,
      end: points[0],
      isCutting: false
    });
    
    currentPosition = points[0];
    
    // Processar os movimentos de corte entre pontos
    for (let i = 1; i < points.length; i++) {
      movements.push({
        start: currentPosition,
        end: points[i],
        isCutting: true
      });
      
      currentPosition = points[i];
    }
    
    // Se o elemento for fechado e tivermos mais de um ponto,
    // verificamos se o último ponto já é igual ao primeiro
    if (element.isClosed && points.length > 1) {
      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      
      // Se o último ponto não é igual ao primeiro, adicionamos um movimento para fechar
      if (Math.abs(firstPoint.x - lastPoint.x) > 0.001 || 
          Math.abs(firstPoint.y - lastPoint.y) > 0.001) {
        movements.push({
          start: currentPosition,
          end: firstPoint,
          isCutting: true
        });
        
        currentPosition = firstPoint;
      }
    }
  });
  
  return movements;
}