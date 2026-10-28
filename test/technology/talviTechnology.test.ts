import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  calculateCuttingTime, calculateCuttingTimeFromDxf, calculateCuttingTimeFromSvg,
  getMachineProfile, getTalviTechnologyOptions, TALVI_CARBON_STEEL_RECIPES
} from '../../src';

const sourceFile = '8mm aco carbono d1.5.HSTool';
const table = { rapidSpeed: 1200, setupTimeSec: 0, accelerationMmPerSec2: 1000 };

describe('Talvi HSTool technology', () => {
  it('converts the inferred mm/s and ms units and identifies the approximation', () => {
    const options = getTalviTechnologyOptions(sourceFile);
    expect(options.machineProfile).toBe('talvi-6000w-raytools');
    expect(options.materialThickness).toBe(8);
    expect(options.cuttingSpeed).toBe(1500);
    expect(options.pierceTime).toBeCloseTo(0.56, 10);
    expect(options.assumptions.length).toBeGreaterThan(0);
    expect(options.timingBasis).toBe('estimated-stage-sum');
    expect(options.speedUnit).toBe('mm/s');
    expect(options.timeUnit).toBe('ms');
    expect(options.assumptions.join(' ')).toMatch(/não confirmada/);
    expect(options.assumptions.join(' ')).toMatch(/sobreposição/);
    expect(options.recipe.gas).toBe('O2');
  });

  it('preserves all 17 exact sources and recursively freezes raw recipe data', () => {
    expect(TALVI_CARBON_STEEL_RECIPES).toHaveLength(17);
    expect(new Set(TALVI_CARBON_STEEL_RECIPES.map(recipe => recipe.sourceFile)).size).toBe(17);
    expect(Object.isFrozen(TALVI_CARBON_STEEL_RECIPES)).toBe(true);
    expect(TALVI_CARBON_STEEL_RECIPES.reduce((total, recipe) => total + recipe.activePierceStages.length, 0)).toBe(23);
    for (const recipe of TALVI_CARBON_STEEL_RECIPES) {
      expect(Object.isFrozen(recipe)).toBe(true);
      expect(Object.isFrozen(recipe.activePierceStages)).toBe(true);
      expect(recipe.thicknessMm).toBe(parseFloat(recipe.sourceFile));
      for (const stage of recipe.activePierceStages) expect(Object.isFrozen(stage)).toBe(true);
      const options = getTalviTechnologyOptions(recipe.sourceFile, { pierceTimeSec: 1 });
      expect(options.recipe).toBe(recipe);
      expect(options.cuttingSpeed).toBe(recipe.speed * 60);
    }
  });

  it.each([
    ['4.75mm aco carbono d 1.5mm.HSTool', 'O2', 2700],
    ['4.75mm aco carbono s2.5.HSTool', 'N2', 5000],
    ['6.3mm aco carbono d 1.5mm.HSTool', 'O2', 2000],
    ['6.3mm aco carbono s3.0.HSTool', 'N2', 5100],
    ['6.3mm aco carbono d 2 HSTool', 'N2', 5100]
  ] as const)('never merges gas/nozzle alternatives for %s', (file, gas, cuttingSpeed) => {
    const options = getTalviTechnologyOptions(file);
    expect(options.recipe.gas).toBe(gas);
    expect(options.cuttingSpeed).toBeCloseTo(cuttingSpeed, 10);
  });

  it.each([
    ['0.9mm aco carbono s1.5.HSTool', 18000],
    ['1.2mm aco carbono s1.5.HSTool', 18000],
    ['1.5mm aco carbono s1.5.HSTool', 12000],
    ['2mm aco carbono s1.5.HSTool', 12000]
  ])('does not count disabled stage templates as a full cycle for %s', (file, feed) => {
    expect(() => getTalviTechnologyOptions(file)).toThrow(/pierceTimeSec medido/);
    const options = getTalviTechnologyOptions(file, { pierceTimeSec: 0.125 });
    expect(options.cuttingSpeed).toBe(feed);
    expect(options.pierceTime).toBe(0.125);
    expect(options.recipe.activePierceStages).toEqual([]);
    expect(options.timingBasis).toBe('explicit-cycle');
    expect(options.assumptions.join(' ')).not.toMatch(/soma/);
  });

  it.each([
    ['3mm aco carbono s3.0.HSTool', 0.61],
    ['12.5mm aco carbono d2.0.HSTool', 4.31],
    ['14mm aco carbono d3.0.HSTool', 4.81],
    ['16mm aco carbono d2.0.HSTool', 5.61],
    ['19mm aco carbono d4.0.HSTool', 5.61],
    ['23mm aco carbono d4.5.HSTool', 8.01]
  ])('reports only an estimated active-stage sum for %s', (file, seconds) => {
    const options = getTalviTechnologyOptions(file);
    expect(options.pierceTime).toBeCloseTo(seconds, 10);
    expect(options.timingBasis).toBe('estimated-stage-sum');
  });

  it('lets confirmed units replace inferences without retaining incorrect unit warnings', () => {
    const options = getTalviTechnologyOptions(sourceFile, { speedUnit: 'mm/min', timeUnit: 's' });
    expect(options.cuttingSpeed).toBe(25);
    expect(options.pierceTime).toBe(560);
    expect(options.assumptions).toHaveLength(1);
    expect(options.assumptions[0]).toMatch(/Perfuração estimada/);
    const measured = getTalviTechnologyOptions(sourceFile, {
      speedUnit: 'mm/s', timeUnit: 'ms', pierceTimeSec: 2
    });
    expect(measured.pierceTime).toBe(2);
    expect(measured.assumptions).toEqual([]);
    expect(measured.timingBasis).toBe('explicit-cycle');
    expect(Object.isFrozen(measured.assumptions)).toBe(true);
  });

  it('honors explicit zero durations without adding inferred delays', () => {
    const options = getTalviTechnologyOptions('19mm aco carbono d4.0.HSTool', { pierceTimeSec: 0 });
    expect(options.pierceTime).toBe(0);
    expect(options.timingBasis).toBe('explicit-cycle');
  });

  it.each([NaN, Infinity, -1])('rejects invalid full-cycle override %s', pierceTimeSec => {
    expect(() => getTalviTechnologyOptions(sourceFile, { pierceTimeSec })).toThrow(/finito/);
  });

  it('rejects invalid runtime units rather than silently selecting a conversion', () => {
    // @ts-expect-error Validate external callers without TypeScript.
    expect(() => getTalviTechnologyOptions(sourceFile, { speedUnit: 'm/min' })).toThrow(/velocidade inválida/);
    // @ts-expect-error Validate external callers without TypeScript.
    expect(() => getTalviTechnologyOptions(sourceFile, { timeUnit: 'minutes' })).toThrow(/tempo inválida/);
  });

  it.each(['missing', '__proto__', '8', '6.35mm aco carbono d1.5.HSTool'])(
    'rejects unknown source %s rather than guessing a recipe', file => {
      expect(() => getTalviTechnologyOptions(file)).toThrow(/desconhecida/);
    }
  );

  it('does not infer rapid/setup/acceleration or import Glory Star overhead', () => {
    const options = getTalviTechnologyOptions(sourceFile);
    expect(options.rapidSpeed).toBeUndefined();
    expect(options.setupTimeSec).toBeUndefined();
    expect(options.accelerationMmPerSec2).toBeUndefined();
    expect(getMachineProfile('talvi-6000w-raytools').cuttingSpeeds).toBeUndefined();
    expect(() => calculateCuttingTime([], options)).toThrow(/Velocidade de posicionamento/);
    const movements = [{ start: { x: 0, y: 0 }, end: { x: 1500, y: 0 }, isCutting: true }];
    const result = calculateCuttingTime(movements, { ...options, ...table });
    expect(result.cuttingTimeSec).toBeCloseTo(60.025, 10);
    expect(result.piercingTimeSec).toBeCloseTo(0.56, 10);
    expect(result.totalTimeSec).toBeCloseTo(60.585, 10);
  });

  it('uses the Talvi recipe consistently through SVG and DXF adapters', () => {
    const options = { ...getTalviTechnologyOptions(sourceFile), ...table };
    const dxf = readFileSync(resolve(__dirname, '../../fixtures/drawings/quadrado.dxf'), 'utf8');
    for (const result of [
      calculateCuttingTimeFromSvg('<svg><rect width="100" height="50"/></svg>', options),
      calculateCuttingTimeFromDxf(dxf, options)
    ]) {
      expect(result.piercingTimeSec).toBeCloseTo(result.pierceCount * 0.56, 10);
      expect(result.setupTimeSec).toBe(0);
    }
  });
});
