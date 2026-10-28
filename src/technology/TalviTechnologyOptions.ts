import type { CuttingTimeOptions } from '../models/CuttingTimeOptions';
import type { TalviCarbonSteelRecipe } from './profiles/TalviCarbonSteelRecipe';

/** Calculator options plus provenance and visible approximation warnings for Talvi recipe selection. */
export interface TalviTechnologyOptions extends CuttingTimeOptions {
  readonly machineProfile: 'talvi-6000w-raytools';
  readonly cuttingSpeed: number;
  readonly pierceTime: number;
  readonly recipe: TalviCarbonSteelRecipe;
  readonly speedUnit: 'mm/s' | 'mm/min';
  readonly timeUnit: 'ms' | 's';
  readonly timingBasis: 'estimated-stage-sum' | 'explicit-cycle';
  readonly assumptions: readonly string[];
}
