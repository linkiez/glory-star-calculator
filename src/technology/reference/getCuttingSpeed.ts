import { getMachineProfile } from '../profiles/getMachineProfile';
import type { MachineProfileId } from '../profiles/MachineProfileId';
import { interpolateParameter } from './interpolateParameter';

/**
 * Returns the selected machine's reference feed in mm/min, not a material-specific recipe.
 * @param thickness - Positive thickness in mm; discrete machine recipes require an exact match.
 * @param machineProfile - Machine identifier; defaults to Glory Star.
 * @returns Interpolated reference feed.
 * @throws Error for invalid thickness, unknown machines or unavailable reference data.
 */
export function getCuttingSpeed(thickness: number, machineProfile?: MachineProfileId): number {
  const profile = getMachineProfile(machineProfile);
  if (!profile.cuttingSpeeds) throw new Error(`${profile.name}: informe a velocidade de corte da receita`);
  return interpolateParameter(profile.cuttingSpeeds, thickness, profile.exactThicknessOnly);
}
