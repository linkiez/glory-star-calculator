import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  calculateCuttingTime, calculateCuttingTimeFromDxf, calculateCuttingTimeFromSvg,
  getMachineProfile, getCuttingSpeed, getPierceTime, getHprCarbonSteelRecipe, HPR_CARBON_STEEL_RECIPES
} from '../../src';
import type { CuttingTimeOptions, Movement } from '../../src';

const options: CuttingTimeOptions = {
  machineProfile: 'hypertherm-hpr400xd', materialThickness: 12,
  rapidSpeed: 1200, setupTimeSec: 0, accelerationMmPerSec2: 1000
};
const movements: Movement[] = [
  { start: { x: 0, y: 0 }, end: { x: 1410, y: 0 }, isCutting: true }
];

describe('Hypertherm HPR400XD carbon steel', () => {
  it('registers an isolated plasma profile with carbon-steel reference data', () => {
    const profile = getMachineProfile('hypertherm-hpr400xd');
    expect(profile.cuttingSpeeds?.[12]).toBe(1410);
    expect(profile.pierceTimes?.[12]).toBe(0.7);
    expect(profile.rapidSpeed).toBeUndefined();
    expect(profile.referenceMotion).toBeUndefined();
    expect(profile.setupTimeSec).toBeUndefined();
    expect(profile.accelerationMmPerSec2).toBeUndefined();
    expect(profile).toMatchObject({
      maxCurrentA: 400, material: 'carbon-steel', plasmaGas: 'O2', shieldGas: 'Air',
      exactThicknessOnly: true, parameterStatus: 'reference'
    });
  });

  it.each([
    [2, 80, 9810, 0.1, 1, 372],
    [12, 80, 1410, 0.7, 2, 678],
    [20, 80, 545, 0.9, 2.72, 781],
    [21, 130, 948, 1.2, 2.883, 1226],
    [26, 130, 496, 1.8, 3.506, 1276],
    [27, 260, 1523, 0.9, 3.81, 2570],
    [32, 260, 1135, 1, 4.32, 2669],
    [33, 400, 1566, 1.3, 4.261, 3328],
    [50, 400, 795, 5.2, 5.94, 3471]
  ])('preserves source recipe and current selection for %s mm',
    (thicknessMm, currentA, cuttingSpeedMmPerMin, pierceTimeSec, kerfMm, sourceRow) => {
      expect(getHprCarbonSteelRecipe(thicknessMm)).toEqual({
        thicknessMm, currentA, cuttingSpeedMmPerMin, pierceTimeSec, kerfMm, sourceRow
      });
    }
  );

  it('keeps the 43 discrete recipes immutable and their derived tables consistent', () => {
    const profile = getMachineProfile('hypertherm-hpr400xd');
    expect(HPR_CARBON_STEEL_RECIPES).toHaveLength(43);
    expect(new Set(HPR_CARBON_STEEL_RECIPES.map(recipe => recipe.thicknessMm)).size).toBe(43);
    expect(Object.isFrozen(HPR_CARBON_STEEL_RECIPES)).toBe(true);
    for (const recipe of HPR_CARBON_STEEL_RECIPES) {
      expect(Object.isFrozen(recipe)).toBe(true);
      expect(getHprCarbonSteelRecipe(recipe.thicknessMm)).toBe(recipe);
      expect(getCuttingSpeed(recipe.thicknessMm, 'hypertherm-hpr400xd')).toBe(recipe.cuttingSpeedMmPerMin);
      expect(getPierceTime(recipe.thicknessMm, 'hypertherm-hpr400xd')).toBe(recipe.pierceTimeSec);
      expect(profile.kerfDistances?.[recipe.thicknessMm]).toBe(recipe.kerfMm);
    }
    expect(Object.isFrozen(profile.cuttingSpeeds)).toBe(true);
    expect(Object.isFrozen(profile.pierceTimes)).toBe(true);
    expect(Object.isFrozen(profile.kerfDistances)).toBe(true);
  });

  it.each([0, -1, NaN, Infinity, 1, 6.35, 20.5, 26.5, 32.5, 39, 41, 46, 51])(
    'never invents a recipe, clamps or blends currents for %s mm', materialThickness => {
      expect(() => getHprCarbonSteelRecipe(materialThickness)).toThrow();
      expect(() => getCuttingSpeed(materialThickness, 'hypertherm-hpr400xd')).toThrow();
      expect(() => getPierceTime(materialThickness, 'hypertherm-hpr400xd')).toThrow();
      expect(() => calculateCuttingTime(movements, { ...options, materialThickness })).toThrow();
    }
  );

  it.each([
    ['rapidSpeed', 'Velocidade de posicionamento'],
    ['setupTimeSec', 'Tempo de setup'],
    ['accelerationMmPerSec2', 'Aceleração']
  ] as const)('requires table-specific %s instead of using laser defaults', (field, label) => {
    const incomplete = { ...options };
    delete incomplete[field];
    expect(() => calculateCuttingTime(movements, incomplete)).toThrow(label);
  });

  it('uses normal Pierce Time rather than the shorter Edge Pierce Time', () => {
    const result = calculateCuttingTime(movements, options);
    expect(result.cuttingTimeSec).toBeCloseTo(60 + 23.5 / 1000, 10);
    expect(result.piercingTimeSec).toBe(0.7);
    expect(result.totalTimeSec).toBeCloseTo(60.7235, 10);
  });

  it('allows measured overrides without altering the profile or blending with its recipes', () => {
    const result = calculateCuttingTime(movements, {
      ...options, materialThickness: 6.35, cuttingSpeed: 1410, pierceTime: 1.25
    });
    expect(result.piercingTimeSec).toBe(1.25);
    expect(result.cuttingTimeSec).toBeCloseTo(60.0235, 10);
    expect(getHprCarbonSteelRecipe(12).pierceTimeSec).toBe(0.7);
    expect(() => calculateCuttingTime(movements, {
      ...options, materialThickness: 6.35, cuttingSpeed: 1410
    })).toThrow(/receita tabelada/);
    expect(() => calculateCuttingTime(movements, {
      ...options, materialThickness: 6.35, pierceTime: 1.25
    })).toThrow(/receita tabelada/);
  });

  it('uses the profile consistently in SVG and DXF adapters', () => {
    const svg = '<svg><rect width="100" height="50"/></svg>';
    const dxf = readFileSync(resolve(__dirname, '../../fixtures/drawings/quadrado.dxf'), 'utf8');
    for (const result of [
      calculateCuttingTimeFromSvg(svg, options),
      calculateCuttingTimeFromDxf(dxf, options)
    ]) {
      expect(result.piercingTimeSec).toBe(result.pierceCount * 0.7);
      expect(result.setupTimeSec).toBe(0);
    }
    expect(() => calculateCuttingTimeFromSvg(svg, { ...options, materialThickness: 6.35 })).toThrow();
    expect(() => calculateCuttingTimeFromDxf(dxf, { ...options, materialThickness: 6.35 })).toThrow();
  });
});
