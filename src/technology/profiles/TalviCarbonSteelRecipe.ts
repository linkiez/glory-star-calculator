import type { TalviPierceStage } from './TalviPierceStage';

/** User-confirmed Talvi carbon-steel recipe; source numeric units are retained, not certified. */
export interface TalviCarbonSteelRecipe {
  readonly sourceFile: string;
  /** Thickness comes from the source filename, not a thickness field inside the XML. */
  readonly thicknessMm: number;
  readonly speed: number;
  readonly power: number;
  readonly gas: 'N2' | 'O2';
  readonly gasPressure: number;
  readonly height: number;
  readonly focus: number;
  readonly preCutDelay: number;
  readonly coolDelay: number;
  /** Only bOpen=true stages; disabled template values never contribute to timing. */
  readonly activePierceStages: readonly TalviPierceStage[];
}
