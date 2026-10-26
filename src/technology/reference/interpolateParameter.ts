/**
 * Resolves a reference value, retaining interpolation/clamping unless the process requires exact thickness.
 * @param table - Reference values indexed by thickness in mm.
 * @param thickness - Positive finite thickness in mm.
 * @param exactThicknessOnly - Reject unlisted thicknesses instead of inventing discrete process settings.
 * @returns Exact or interpolated reference value.
 * @throws Error for invalid thickness or an unlisted discrete recipe.
 */
export function interpolateParameter(
  table: Readonly<Record<number, number>>, thickness: number, exactThicknessOnly = false
): number {
  if (!Number.isFinite(thickness) || thickness <= 0) {
    throw new Error('Espessura deve ser um número positivo e finito');
  }
  if (exactThicknessOnly) {
    if (!Object.prototype.hasOwnProperty.call(table, thickness)) {
      throw new Error(`Espessura ${thickness} mm sem receita tabelada; informe os parâmetros da receita`);
    }
    return table[thickness];
  }
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  if (thickness <= keys[0]) return table[keys[0]];
  for (let i = 1; i < keys.length; i++) {
    if (thickness <= keys[i]) {
      const lower = keys[i - 1];
      const ratio = (thickness - lower) / (keys[i] - lower);
      return table[lower] + ratio * (table[keys[i]] - table[lower]);
    }
  }
  return table[keys[keys.length - 1]];
}
