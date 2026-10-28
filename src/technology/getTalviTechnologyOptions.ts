import type { TalviTechnologySelection } from './TalviTechnologySelection';
import type { TalviTechnologyOptions } from './TalviTechnologyOptions';
import { TALVI_CARBON_STEEL_RECIPES } from './profiles/talviCarbonSteelRecipes';

/**
 * Selects one user-confirmed Talvi source file, keeping gas/nozzle alternatives separate.
 * @param sourceFile - Exact HSTool filename from the carbon-steel catalog.
 * @param selection - Unit corrections and optional measured full piercing cycle.
 * @returns Canonical calculator options and explicit warnings about inferred units/timing.
 * @throws Error for unknown files, invalid units/durations or no enabled piercing stages without an override.
 */
export function getTalviTechnologyOptions(
  sourceFile: string, selection: TalviTechnologySelection = {}
): TalviTechnologyOptions {
  const recipe = TALVI_CARBON_STEEL_RECIPES.find(candidate => candidate.sourceFile === sourceFile);
  if (!recipe) throw new Error(`Talvi: receita de aço carbono desconhecida: ${sourceFile}`);
  const speedUnit = selection.speedUnit ?? 'mm/s';
  const timeUnit = selection.timeUnit ?? 'ms';
  if (speedUnit !== 'mm/s' && speedUnit !== 'mm/min') throw new Error('Talvi: unidade de velocidade inválida');
  if (timeUnit !== 'ms' && timeUnit !== 's') throw new Error('Talvi: unidade de tempo inválida');
  const assumptions: string[] = [];
  if (selection.speedUnit === undefined) assumptions.push('Velocidade inferida em mm/s; unidade não confirmada no HSTool.');
  const measured = selection.pierceTimeSec;
  let pierceTime: number;
  if (measured !== undefined) {
    if (!Number.isFinite(measured) || measured < 0) {
      throw new Error('Talvi: tempo de perfuração deve ser não negativo e finito, em segundos');
    }
    pierceTime = measured;
  } else {
    if (recipe.activePierceStages.length === 0) {
      throw new Error(`Talvi: ${sourceFile} sem etapas de perfuração habilitadas; informe pierceTimeSec medido`);
    }
    if (selection.timeUnit === undefined) assumptions.push('Tempos inferidos em ms; unidade não confirmada no HSTool.');
    const rawTime = recipe.preCutDelay + recipe.coolDelay + recipe.activePierceStages.reduce(
      (total, stage) => total + stage.time + stage.residenceTime + stage.closeLaserOpenGasTime, 0
    );
    pierceTime = rawTime * (timeUnit === 'ms' ? 0.001 : 1);
    assumptions.push(
      'Perfuração estimada pela soma de nTime, nResidenceTime e nCloseLaserOpenGasTime das etapas ativas, ' +
      'mais nPreCutDelay/nCoolDelay. A sequência e a sobreposição não estão confirmadas; ' +
      'movimentos do cabeçote e outros tempos auxiliares não estão incluídos. Prefira pierceTimeSec medido.'
    );
  }
  return {
    machineProfile: 'talvi-6000w-raytools',
    materialThickness: recipe.thicknessMm,
    cuttingSpeed: recipe.speed * (speedUnit === 'mm/s' ? 60 : 1),
    pierceTime,
    recipe, speedUnit, timeUnit,
    timingBasis: measured === undefined ? 'estimated-stage-sum' : 'explicit-cycle',
    assumptions: Object.freeze(assumptions)
  };
}
