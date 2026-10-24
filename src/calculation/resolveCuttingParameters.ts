import type { CuttingTimeOptions } from '../models/CuttingTimeOptions';
import { CUTTING_SPEEDS } from '../technology/reference/cuttingSpeeds';
import { PIERCE_TIMES } from '../technology/reference/pierceTimes';
import { RAPID_SPEED } from '../technology/reference/rapidSpeed';
import { SETUP_TIME } from '../technology/reference/setupTime';
import { getCuttingSpeed } from '../technology/reference/getCuttingSpeed';
import { getPierceTime } from '../technology/reference/getPierceTime';

/** Validated parameters ready for geometric and temporal calculation. */
interface CuttingParameters {
  scale: number;
  feed: number;
  pierceTime: number;
  rapid: number;
  setup: number;
  leadLength: number;
  acceleration: number | undefined;
}

function validateValue(value: number, name: string, positive = false): number {
  if (!Number.isFinite(value) || (positive ? value <= 0 : value < 0)) {
    throw new Error(`${name} deve ser um número ${positive ? 'positivo' : 'não negativo'} e finito`);
  }
  return value;
}

/**
 * Resolves recipe overrides and reference defaults at the calculator boundary.
 * @param options - User-supplied process options.
 * @returns Finite process parameters in canonical units.
 * @throws Error for invalid inputs or missing recipe data outside the reference range.
 */
export function resolveCuttingParameters(options: CuttingTimeOptions): CuttingParameters {
  validateValue(options.materialThickness, 'Espessura', true);
  for (const [override, table] of [[options.cuttingSpeed, CUTTING_SPEEDS], [options.pierceTime, PIERCE_TIMES]] as const) {
    const thicknesses = Object.keys(table).map(Number);
    if (override === undefined && (options.materialThickness < Math.min(...thicknesses) ||
        options.materialThickness > Math.max(...thicknesses))) {
      throw new Error('Espessura fora da tabela de referência; informe velocidade e perfuração da receita');
    }
  }
  const scale = validateValue(options.scaleFactor ?? 1, 'Escala', true);
  const feed = validateValue(options.cuttingSpeed ?? getCuttingSpeed(options.materialThickness), 'Velocidade de corte', true);
  const pierceTime = validateValue(options.pierceTime ?? getPierceTime(options.materialThickness), 'Tempo de perfuração');
  const rapid = validateValue(options.rapidSpeed ?? RAPID_SPEED, 'Velocidade de posicionamento', true);
  const setup = validateValue(options.setupTimeSec ?? SETUP_TIME, 'Tempo de setup');
  const leadLength = validateValue(options.leadIn ?? 0, 'Entrada') + validateValue(options.leadOut ?? 0, 'Saída');
  validateValue(options.kerf ?? 0, 'Kerf');
  const acceleration = options.accelerationMmPerSec2;
  if (acceleration !== undefined) validateValue(acceleration, 'Aceleração', true);
  if (options.piercingType && !['normal', 'flying'].includes(options.piercingType)) throw new Error('Tipo de perfuração inválido');
  if (options.piercingType === 'flying' && options.pierceTime === undefined) {
    throw new Error('Perfuração flying exige o tempo de perfuração da máquina');
  }
  return { scale, feed, pierceTime, rapid, setup, leadLength, acceleration };
}
