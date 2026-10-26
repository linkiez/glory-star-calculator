import type { MachineProfile } from './MachineProfile';
import type { MachineProfileId } from './MachineProfileId';
import { MACHINE_PROFILES } from './machineProfiles';

/**
 * Resolves machine identity and defaults without cross-machine fallback.
 * @param id - Machine identifier; omission preserves the Glory Star reference behavior.
 * @returns The immutable registered machine profile.
 * @throws Error when the machine identifier is not registered.
 */
export function getMachineProfile(id: MachineProfileId = 'glory-star-gs3015'): MachineProfile {
  if (!Object.prototype.hasOwnProperty.call(MACHINE_PROFILES, id)) {
    throw new Error(`Perfil de máquina desconhecido: ${id}`);
  }
  return MACHINE_PROFILES[id];
}
