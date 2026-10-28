import type { TalviCarbonSteelRecipe } from './TalviCarbonSteelRecipe';

type SourceRow = readonly [
  sourceFile: string, thicknessMm: number, speed: number, power: number, gas: 'N2' | 'O2',
  gasPressure: number, height: number, focus: number, preCutDelay: number, coolDelay: number,
  activeStages: readonly (readonly [time: number, residenceTime: number, closeLaserOpenGasTime: number])[]
];

/** Raw carbon-steel recipes from the operator's HSTool exports; units are inferred only at selection. */
export const TALVI_CARBON_STEEL_RECIPES: readonly TalviCarbonSteelRecipe[] = Object.freeze(
  ([
    ['0.9mm aco carbono s1.5.HSTool', 0.9, 300, 6000, 'N2', 10, 0.5, -1.5, 0, 0, []],
    ['1.2mm aco carbono s1.5.HSTool', 1.2, 300, 6000, 'N2', 10, 0.5, -1.5, 0, 0, []],
    ['1.5mm aco carbono s1.5.HSTool', 1.5, 200, 5900, 'N2', 10, 0.5, -1.4, 0, 0, []],
    ['2mm aco carbono s1.5.HSTool', 2, 200, 5800, 'N2', 15, 0.5, -3, 0, 0, []],
    ['3mm aco carbono s3.0.HSTool', 3, 150, 5800, 'N2', 15, 0.55, -3.1, 0, 0, [[10, 300, 300]]],
    ['4.75mm aco carbono d 1.5mm.HSTool', 4.75, 45, 4300, 'O2', 0.6, 0.6, 4, 0, 0, [[10, 200, 200]]],
    ['4.75mm aco carbono s2.5.HSTool', 4.75, 83.33333333333333, 5000, 'N2', 15, 0.6, -6.5, 0, 0, [[10, 300, 300]]],
    ['6.3mm aco carbono d 1.5mm.HSTool', 6.3, 33.333333333333336, 4300, 'O2', 0.78, 0.6, 4, 0, 0, [[10, 200, 200]]],
    ['6.3mm aco carbono d 2 HSTool', 6.3, 85, 5800, 'N2', 18, 0.5, -5.3, 0, 0, [[10, 500, 300]]],
    ['6.3mm aco carbono s3.0.HSTool', 6.3, 85, 5800, 'N2', 18, 0.5, -5.3, 0, 0, [[10, 500, 300]]],
    ['8mm aco carbono d1.5.HSTool', 8, 25, 4800, 'O2', 0.8, 0.6, 5, 0, 0, [[10, 350, 200]]],
    ['9.5mm aco carbono d1.5.HSTool', 9.5, 25, 4800, 'O2', 0.8, 0.6, 6, 0, 0, [[10, 200, 200]]],
    ['12.5mm aco carbono d2.0.HSTool', 12.5, 16.666666666666668, 3600, 'O2', 0.6, 0.6, 9.5, 0, 0,
      [[10, 2000, 200], [1000, 1000, 100]]],
    ['14mm aco carbono d3.0.HSTool', 14, 13.333333333333334, 4000, 'O2', 0.56, 0.6, 12, 0, 0,
      [[10, 1200, 200], [1000, 800, 200], [1000, 200, 200]]],
    ['16mm aco carbono d2.0.HSTool', 16, 15, 5000, 'O2', 0.65, 0.6, 15, 0, 0,
      [[10, 1500, 200], [1000, 1000, 200], [1000, 500, 200]]],
    ['19mm aco carbono d4.0.HSTool', 19, 13.333333333333334, 4800, 'O2', 0.7, 0.65, 21, 200, 0,
      [[10, 1000, 200], [1000, 1500, 200], [1000, 300, 200]]],
    ['23mm aco carbono d4.5.HSTool', 23, 8, 2400, 'O2', 1, 1, 3.2, 200, 0,
      [[10, 1200, 200], [1000, 1000, 500], [1000, 600, 500], [1000, 300, 500]]]
  ] satisfies readonly SourceRow[]).map(([
    sourceFile, thicknessMm, speed, power, gas, gasPressure, height, focus, preCutDelay, coolDelay, activeStages
  ]) => Object.freeze({
    sourceFile, thicknessMm, speed, power, gas, gasPressure, height, focus, preCutDelay, coolDelay,
    activePierceStages: Object.freeze(activeStages.map(([time, residenceTime, closeLaserOpenGasTime]) =>
      Object.freeze({ time, residenceTime, closeLaserOpenGasTime })))
  }))
);
