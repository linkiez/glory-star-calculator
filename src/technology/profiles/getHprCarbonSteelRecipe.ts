import type { HprCarbonSteelRecipe } from './HprCarbonSteelRecipe';
import { HPR_CARBON_STEEL_RECIPES } from './hprCarbonSteelRecipes';

/**
 * Selects the lowest tabulated conventional O2/air current for an exact carbon-steel thickness.
 * @param thicknessMm - Listed thickness in mm; no interpolation or endpoint clamping.
 * @returns Immutable reference recipe, including amperage and source worksheet row.
 * @throws Error for invalid or unlisted thicknesses.
 */
export function getHprCarbonSteelRecipe(thicknessMm: number): HprCarbonSteelRecipe {
  if (!Number.isFinite(thicknessMm) || thicknessMm <= 0) {
    throw new Error('Espessura deve ser um número positivo e finito');
  }
  const recipe = HPR_CARBON_STEEL_RECIPES.find(candidate => candidate.thicknessMm === thicknessMm);
  if (!recipe) throw new Error(`HPR400XD: espessura ${thicknessMm} mm sem receita de aço carbono O₂/ar tabelada`);
  return recipe;
}
