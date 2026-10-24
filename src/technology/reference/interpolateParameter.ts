/** Interpolates a positive thickness in a table, retaining endpoint clamping for the public lookup API. */
export function interpolateParameter(table: Record<number, number>, thickness: number): number {
  if (!Number.isFinite(thickness) || thickness <= 0) {
    throw new Error('Espessura deve ser um número positivo e finito');
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
