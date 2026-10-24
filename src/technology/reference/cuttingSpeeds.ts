/** Reference cutting feeds in mm/min by thickness in mm; not a material-specific recipe. */
export const CUTTING_SPEEDS: Record<number, number> = {
  0.5: 16000,
  0.9: 6200,
  1.2: 6000,
  1.5: 4000,
  2: 3400,
  2.65: 3400,
  3: 3400,
  4.75: 2100,
  5: 2200,
  6.35: 1670,
  8: 1370,
  9.5: 1100,
  12.7: 842
};
