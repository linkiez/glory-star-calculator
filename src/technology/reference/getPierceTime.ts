import { getMachineProfile } from '../profiles/getMachineProfile';
import type { MachineProfileId } from '../profiles/MachineProfileId';
import { interpolateParameter } from './interpolateParameter';

/**
 * Returns the selected machine's reference piercing duration in seconds.
 * @param thickness - Positive thickness in mm; discrete machine recipes require an exact match.
 * @param machineProfile - Machine identifier; defaults to Glory Star.
 * @returns Interpolated reference piercing duration.
 * @throws Error for invalid thickness, unknown machines or unavailable reference data.
 */
export function getPierceTime(thickness: number, machineProfile?: MachineProfileId): number {
  const profile = getMachineProfile(machineProfile);
  if (!profile.pierceTimes) throw new Error(`${profile.name}: informe o tempo de perfuração da receita`);
  return interpolateParameter(profile.pierceTimes, thickness, profile.exactThicknessOnly);
}
