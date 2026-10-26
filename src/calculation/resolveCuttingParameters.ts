import type { CuttingTimeOptions } from '../models/CuttingTimeOptions';
import type { MachineProfile } from '../technology/profiles/MachineProfile';
import { getMachineProfile } from '../technology/profiles/getMachineProfile';
import { interpolateParameter } from '../technology/reference/interpolateParameter';

/** Validated parameters ready for geometric and temporal calculation. */
interface CuttingParameters {
  scale: number;
  feed: number;
  pierceTime: number;
  rapid: number;
  setup: number;
  leadLength: number;
  acceleration: number | undefined;
  referenceMotion: MachineProfile['referenceMotion'];
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
  const profile = getMachineProfile(options.machineProfile);
  function required(value: number | undefined, name: string, positive = false): number {
    if (value === undefined) throw new Error(`${profile.name}: informe ${name}`);
    return validateValue(value, name, positive);
  }
  function recipe(override: number | undefined, table: Readonly<Record<number, number>> | undefined,
    name: string, positive = false): number {
    if (override !== undefined) return required(override, name, positive);
    if (!table) return required(undefined, name, positive);
    const thicknesses = Object.keys(table).map(Number);
    if (options.materialThickness < Math.min(...thicknesses) ||
        options.materialThickness > Math.max(...thicknesses)) {
      throw new Error(`${profile.name}: espessura fora da tabela de referência; informe ${name} da receita`);
    }
    return required(interpolateParameter(table, options.materialThickness, profile.exactThicknessOnly), name, positive);
  }
  validateValue(options.materialThickness, 'Espessura', true);
  const scale = validateValue(options.scaleFactor ?? 1, 'Escala', true);
  const feed = recipe(options.cuttingSpeed, profile.cuttingSpeeds, 'Velocidade de corte', true);
  const pierceTime = recipe(options.pierceTime, profile.pierceTimes, 'Tempo de perfuração');
  const rapid = required(options.rapidSpeed ?? profile.rapidSpeed, 'Velocidade de posicionamento', true);
  const setup = required(options.setupTimeSec ?? profile.setupTimeSec, 'Tempo de setup');
  const leadLength = validateValue(options.leadIn ?? 0, 'Entrada') + validateValue(options.leadOut ?? 0, 'Saída');
  validateValue(options.kerf ?? 0, 'Kerf');
  const acceleration = options.accelerationMmPerSec2 ?? profile.accelerationMmPerSec2;
  if (!profile.referenceMotion && acceleration === undefined) required(undefined, 'Aceleração', true);
  if (acceleration !== undefined) validateValue(acceleration, 'Aceleração', true);
  if (options.piercingType && !['normal', 'flying'].includes(options.piercingType)) throw new Error('Tipo de perfuração inválido');
  if (options.piercingType === 'flying' && options.pierceTime === undefined) {
    throw new Error('Perfuração flying exige o tempo de perfuração da máquina');
  }
  return { scale, feed, pierceTime, rapid, setup, leadLength, acceleration, referenceMotion: profile.referenceMotion };
}
