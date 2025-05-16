/**
 * Constantes específicas para a máquina GloryStar_GS3015
 */

// Velocidades de corte para diferentes espessuras em mm/min
export const CUTTING_SPEEDS: Record<number, number> = {
  0.5: 16000,  // 0.5mm - 8000mm/min
  0.9: 6200,  // 1.0mm - 7000mm/min
  1.2: 6000,
  1.5: 4000,  // 1.5mm - 6000mm/min
  2.0: 3400,  // 2.0mm - 5000mm/min
  2.65: 3400,
  3.0: 3400,  // 3.0mm - 3500mm/min
  4.75: 2100,  // 4.0mm - 2800mm/min
  5.0: 2200,  // 5.0mm - 2200mm/min
  6.35: 1670,  // 6.0mm - 1800mm/min
  8.0: 1370,  // 8.0mm - 1400mm/min
  9.5: 1100, // 10.0mm - 1100mm/min
  12.7: 842,  // 12.0mm - 900mm/min
};

// Tempos de perfuração para diferentes espessuras em segundos
export const PIERCE_TIMES: Record<number, number> = {
  0.5: 0.5,
  0.9: 0.1,
  1.2: 0.3,
  1.5: 0.4,
  2.0: 0.2,
  2.65: 0.2,
  3.0: 0.3,
  4.75: 0.8,
  5.0: 0.4,
  6.35: 0.8,
  8.0: 0.8,
  9.5: 0.8,
  12.7: 1.6
};

export const KERF_DISTANCE: Record<number, number> = {
  0.5: 0.0,
  0.9: 0.05,
  1.2: 0.1,
  1.5: 0.35,
  2.0: 0.25,
  2.65: 0.25,
  3.0: 0.3,
  4.75: 0.35,
  5.0: 0.35,
  6.35: 0.25,
  8.0: 0.4,
  9.5: 0.4,
  12.7: 1.4
};

// Velocidade de movimento rápido (posicionamento) em mm/min
export const RAPID_SPEED = 16000;

// Tempo médio de aceleração/desaceleração em segundos
export const ACCELERATION_TIME = 0.2;

// Distância mínima para considerar aceleração/desaceleração em mm
export const MIN_DISTANCE_FOR_ACCELERATION = 5.0;

// Tempo de configuração por parte em segundos
export const SETUP_TIME = 1.5;

// Distância máxima para manter o cabeçote abaixado durante movimentos em mm
export const MAX_DISTANCE_FOR_HEAD_DOWN = 3.0;

// Distância máxima para realizar um salto (jump) em mm
export const MAX_DISTANCE_FOR_JUMP = 10.0;