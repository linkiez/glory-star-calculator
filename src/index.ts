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
  calculateCuttingTimeFromSvg,
  calculateCuttingTimeFromFile,
  calculateCuttingTime,
  getCuttingSpeed,
  getPierceTime,
  calculateDistance
} from './cuttingCalculator';

export {
  calculateCuttingTimeFromSvg,
  calculateCuttingTimeFromFile,
  calculateCuttingTime,
  getCuttingSpeed,
  getPierceTime,
  calculateDistance
};

// Exporta funções de processamento de SVG que podem ser úteis
import {
  loadSvgFile,
  processSvg,
  convertElementsToMovements
} from './svgProcessor';

export {
  loadSvgFile,
  processSvg,
  convertElementsToMovements
};