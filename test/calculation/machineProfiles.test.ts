import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  calculateCuttingTime, calculateCuttingTimeFromDxf, calculateCuttingTimeFromSvg,
  getCuttingSpeed, getPierceTime, getMachineProfile, getLaserTechnologyOptions, MACHINE_PROFILES
} from '../../src';
import type { CuttingTimeOptions } from '../../src';
import type { Movement } from '../../src/models';

const movements: Movement[] = [
  { start: { x: 0, y: 0 }, end: { x: 20, y: 0 }, isCutting: false },
  { start: { x: 20, y: 0 }, end: { x: 40, y: 0 }, isCutting: true }
];
const talviOptions: CuttingTimeOptions = {
  machineProfile: 'talvi-6000w-raytools', materialThickness: 3,
  cuttingSpeed: 600, pierceTime: 0.5, rapidSpeed: 1200, setupTimeSec: 2,
  accelerationMmPerSec2: 10
};
const svg = '<svg><rect width="20" height="10"/></svg>';

describe('Machine profiles', () => {
  it('never uses Glory Star parameters for an unconfigured Talvi', () => {
    const options = { materialThickness: 3, machineProfile: 'talvi-6000w-raytools' as const };
    expect(() => calculateCuttingTime(movements, options)).toThrow(/Talvi/);
  });

  it('exposes immutable identities without inventing Talvi parameters', () => {
    const profile = getMachineProfile('talvi-6000w-raytools');
    expect(profile).toEqual({
      id: 'talvi-6000w-raytools', name: 'Talvi 6000 W / Raytools',
      laserPowerW: 6000, cuttingHead: 'Raytools', parameterStatus: 'requires-parameters'
    });
    expect(Object.keys(MACHINE_PROFILES)).toHaveLength(3);
    expect(Object.isFrozen(MACHINE_PROFILES)).toBe(true);
    expect(Object.isFrozen(profile)).toBe(true);
    expect(Object.isFrozen(getMachineProfile().cuttingSpeeds)).toBe(true);
    expect(Object.isFrozen(getMachineProfile().referenceMotion)).toBe(true);
  });

  it.each(['missing', '__proto__', 'constructor'])('rejects unknown runtime profile %s', machineProfile => {
    // @ts-expect-error Exercise callers without TypeScript validation.
    expect(() => calculateCuttingTime(movements, { materialThickness: 3, machineProfile })).toThrow(/desconhecido/);
  });

  it.each([
    ['cuttingSpeed', 'Velocidade de corte'],
    ['pierceTime', 'Tempo de perfuração'],
    ['rapidSpeed', 'Velocidade de posicionamento'],
    ['setupTimeSec', 'Tempo de setup'],
    ['accelerationMmPerSec2', 'Aceleração']
  ] as const)('requires Talvi parameter %s independently', (field, name) => {
    const incomplete = { ...talviOptions };
    delete incomplete[field];
    expect(() => calculateCuttingTime(movements, incomplete)).toThrow(`Talvi 6000 W / Raytools: informe ${name}`);
  });

  it.each(['cuttingSpeed', 'pierceTime', 'rapidSpeed', 'setupTimeSec', 'accelerationMmPerSec2'] as const)(
    'rejects nonfinite Talvi %s', field => {
      expect(() => calculateCuttingTime(movements, { ...talviOptions, [field]: NaN })).toThrow(/finito/);
    }
  );

  it('uses explicit Talvi motion, travel, piercing and setup without Glory overhead', () => {
    const result = calculateCuttingTime(movements, talviOptions);
    expect(result.cuttingTimeSec).toBeCloseTo(3, 10);
    expect(result.movementTimeSec).toBeCloseTo(2 * Math.sqrt(2), 10);
    expect(result.piercingTimeSec).toBe(0.5);
    expect(result.setupTimeSec).toBe(2);
    expect(result.totalTimeSec).toBeCloseTo(5.5 + 2 * Math.sqrt(2), 10);
  });

  it('accepts deliberate zero setup and piercing rather than substituting Glory defaults', () => {
    const result = calculateCuttingTime(movements, { ...talviOptions, pierceTime: 0, setupTimeSec: 0 });
    expect(result.piercingTimeSec).toBe(0);
    expect(result.setupTimeSec).toBe(0);
  });

  it('accepts explicit recipes outside the Glory thickness range', () => {
    expect(calculateCuttingTime(movements, { ...talviOptions, materialThickness: 50 }))
      .toEqual(calculateCuttingTime(movements, talviOptions));
  });

  it('keeps public reference lookups scoped to the selected machine', () => {
    expect(getCuttingSpeed(3, 'glory-star-gs3015')).toBe(getCuttingSpeed(3));
    expect(getPierceTime(3, 'glory-star-gs3015')).toBe(getPierceTime(3));
    expect(() => getCuttingSpeed(3, 'talvi-6000w-raytools')).toThrow(/Talvi/);
    expect(() => getPierceTime(3, 'talvi-6000w-raytools')).toThrow(/Talvi/);
  });

  it.each(['quadrado', 'redondo', 'LPEL-0040', 'LPEL-1530'])(
    'preserves implicit and explicit Glory Star estimates for %s', name => {
      const dxf = readFileSync(resolve(__dirname, `../../fixtures/drawings/${name}.dxf`), 'utf8');
      for (const optimize of [false, true]) {
        expect(calculateCuttingTimeFromDxf(dxf, { materialThickness: 3, optimize, machineProfile: 'glory-star-gs3015' }))
          .toEqual(calculateCuttingTimeFromDxf(dxf, { materialThickness: 3, optimize }));
        expect(calculateCuttingTimeFromDxf(dxf, talviOptions).totalTimeSec).toBeGreaterThan(0);
        expect(() => calculateCuttingTimeFromDxf(dxf, {
          materialThickness: 3, machineProfile: 'talvi-6000w-raytools'
        })).toThrow(/Talvi/);
      }
    }
  );

  it('uses the selected profile through SVG adapters', () => {
    expect(calculateCuttingTimeFromSvg(svg, talviOptions).cuttingTimeSec).toBeCloseTo(7, 10);
    expect(() => calculateCuttingTimeFromSvg(svg, {
      materialThickness: 3, machineProfile: 'talvi-6000w-raytools'
    })).toThrow(/Talvi/);
  });

  it('combines an explicitly supplied CSV recipe with Talvi motion parameters', () => {
    const recipe = getLaserTechnologyOptions('CODE,TH,A_CUT_FEED,A_PIERCE_TIME\n1,3,600,500', {
      code: '1', cutProfile: 'A', pierceProfile: 'A', pierceTimeUnit: 'ms'
    });
    expect(calculateCuttingTime(movements, { ...talviOptions, ...recipe }))
      .toEqual(calculateCuttingTime(movements, talviOptions));
  });
});
