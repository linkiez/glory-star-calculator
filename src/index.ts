/**
 * Glory Star GS3015 Cutting Time Calculator
 * 
 * Biblioteca para calcular o tempo de corte a partir de arquivos SVG 
 * específica para a máquina de corte a laser GloryStar_GS3015
 */

// Exporta tipos, interfaces e enums
export * from './types';

// Exporta constantes
export * from './constants';

// Exporta as funções principais de cálculo de tempo de corte
import {
  calculateCuttingTime,
  calculateCuttingTimeFromDxf,
  calculateCuttingTimeFromSvg,
  calculateDistance,
  getCuttingSpeed,
  getPierceTime
} from './cuttingCalculator';

export {
  calculateCuttingTime, calculateCuttingTimeFromDxf, calculateCuttingTimeFromSvg, calculateDistance, getCuttingSpeed,
  getPierceTime
};

// Exporta funções de processamento de SVG que podem ser úteis
  import {
    convertElementsToMovements,
    processSvg
  } from './svgProcessor';

export {
  convertElementsToMovements, processSvg
};
