/**
 * Constantes específicas para a máquina GloryStar_GS3015
 */

// Velocidades de corte para diferentes espessuras em mm/min
export const CUTTING_SPEEDS: Record<number, number> = {
  0.5: 8000,  // 0.5mm - 8000mm/min
  1.0: 7000,  // 1.0mm - 7000mm/min
  1.5: 6000,  // 1.5mm - 6000mm/min
  2.0: 5000,  // 2.0mm - 5000mm/min
  3.0: 3500,  // 3.0mm - 3500mm/min
  4.0: 2800,  // 4.0mm - 2800mm/min
  5.0: 2200,  // 5.0mm - 2200mm/min
  6.0: 1800,  // 6.0mm - 1800mm/min
  8.0: 1400,  // 8.0mm - 1400mm/min
  10.0: 1100, // 10.0mm - 1100mm/min
  12.0: 900,  // 12.0mm - 900mm/min
  15.0: 700,  // 15.0mm - 700mm/min
  20.0: 500,  // 20.0mm - 500mm/min
  25.0: 350,  // 25.0mm - 350mm/min
  30.0: 250   // 30.0mm - 250mm/min
};

// Tempos de perfuração para diferentes espessuras em segundos
export const PIERCE_TIMES: Record<number, number> = {
  0.5: 0.2,   // 0.5mm - 0.2s
  1.0: 0.3,   // 1.0mm - 0.3s
  1.5: 0.4,   // 1.5mm - 0.4s
  2.0: 0.5,   // 2.0mm - 0.5s
  3.0: 0.7,   // 3.0mm - 0.7s
  4.0: 0.9,   // 4.0mm - 0.9s
  5.0: 1.1,   // 5.0mm - 1.1s
  6.0: 1.3,   // 6.0mm - 1.3s
  8.0: 1.7,   // 8.0mm - 1.7s
  10.0: 2.2,  // 10.0mm - 2.2s
  12.0: 2.8,  // 12.0mm - 2.8s
  15.0: 3.5,  // 15.0mm - 3.5s
  20.0: 5.0,  // 20.0mm - 5.0s
  25.0: 7.0,  // 25.0mm - 7.0s
  30.0: 10.0  // 30.0mm - 10.0s
};

// Velocidade de movimento rápido (posicionamento) em mm/min
export const RAPID_SPEED = 30000;

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