import type { MachineProfileId } from './MachineProfileId';

/** Machine identity and verified/reference defaults; absent values must be supplied by the caller. */
export interface MachineProfile {
  readonly id: MachineProfileId;
  readonly name: string;
  readonly laserPowerW?: number;
  readonly cuttingHead?: string;
  readonly maxCurrentA?: number;
  readonly material?: 'carbon-steel';
  readonly plasmaGas?: 'O2';
  readonly shieldGas?: 'Air';
  readonly parameterStatus: 'reference' | 'requires-parameters';
  /** Discrete process recipes must not be interpolated or clamped across current changes. */
  readonly exactThicknessOnly?: boolean;
  readonly cuttingSpeeds?: Readonly<Record<number, number>>;
  readonly pierceTimes?: Readonly<Record<number, number>>;
  readonly rapidSpeed?: number;
  readonly setupTimeSec?: number;
  readonly accelerationMmPerSec2?: number;
  readonly referenceMotion?: {
    readonly accelerationTimeSec: number;
    readonly minDistanceMm: number;
  };
  readonly kerfDistances?: Readonly<Record<number, number>>;
  readonly maxDistanceForHeadDown?: number;
  readonly maxDistanceForJump?: number;
}
