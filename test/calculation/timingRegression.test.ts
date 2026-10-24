import { calculateCuttingTime, calculateCuttingTimeFromDxf } from '../../src';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Movement } from '../../src/models';

const line = (x: number, end: number): Movement => ({
  start: { x, y: 0 }, end: { x: end, y: 0 }, isCutting: true
});

describe('Timing invariants', () => {
  it.each([false, true])('counts disconnected paths and travel (optimize=%s)', optimize => {
    const result = calculateCuttingTime([line(0, 10), line(100, 110)], {
      materialThickness: 3, kerf: 0, optimize
    });
    expect(result.pierceCount).toBe(2);
    expect(result.movementDistance).toBe(90);
    expect(result.setupTimeSec).toBe(1.5);
  });

  it('does not change the result when a straight cut is subdivided', () => {
    const options = { materialThickness: 3, kerf: 0 };
    const whole = calculateCuttingTime([line(0, 100)], options);
    const split = calculateCuttingTime(Array.from({ length: 100 }, (_, i) => line(i, i + 1)), options);
    expect(split).toEqual(whole);
  });

  it('scales geometry before timing, not overheads', () => {
    expect(calculateCuttingTime([line(0, 100)], { materialThickness: 3, scaleFactor: 2 }))
      .toEqual(calculateCuttingTime([line(0, 200)], { materialThickness: 3 }));
  });

  it('does not treat kerf as a percentage of contour length', () => {
    expect(calculateCuttingTime([line(0, 100)], { materialThickness: 3, kerf: 0.3 }).cuttingDistance)
      .toBe(100);
  });

  it.each([NaN, Infinity, 0, -1])('rejects invalid thickness %s', materialThickness => {
    expect(() => calculateCuttingTime([line(0, 10)], { materialThickness })).toThrow();
  });

  it('rejects invalid geometry instead of returning a plausible time', () => {
    expect(() => calculateCuttingTime([line(0, NaN)], { materialThickness: 3 })).toThrow();
  });

  it('requires a recipe outside the reference thickness range', () => {
    expect(() => calculateCuttingTime([line(0, 10)], { materialThickness: 20 })).toThrow();
    expect(calculateCuttingTime([line(0, 10)], {
      materialThickness: 20, cuttingSpeed: 600, pierceTime: 1, setupTimeSec: 0
    }).totalTimeSec).toBeCloseTo(2.2, 5);
  });

  it('calculates triangular and trapezoidal motion from explicit acceleration', () => {
    const options = { materialThickness: 3, cuttingSpeed: 600, pierceTime: 0, setupTimeSec: 0, accelerationMmPerSec2: 10 };
    expect(calculateCuttingTime([line(0, 1)], options).totalTimeSec).toBeCloseTo(2 * Math.sqrt(0.1), 8);
    expect(calculateCuttingTime([line(0, 20)], options).totalTimeSec).toBeCloseTo(3, 8);
  });

  it('includes lead-in and lead-out once per contour without geometrically scaling them', () => {
    const result = calculateCuttingTime([line(0, 10), line(20, 30)], {
      materialThickness: 3, scaleFactor: 2, leadIn: 2, leadOut: 1, cuttingSpeed: 600
    });
    expect(result.cuttingDistance).toBe(46);
    expect(result.cuttingTimeSec).toBeCloseTo(5, 8);
  });

  it.each([false, true])('preserves separate contours that touch (optimize=%s)', optimize => {
    const result = calculateCuttingTime([line(0, 10), { ...line(10, 20), startsContour: true }], {
      materialThickness: 3, optimize
    });
    expect(result.pierceCount).toBe(2);
    expect(result.movementDistance).toBe(0);
  });

  it.each([false, true])('does not add pierces for zero-length cuts (optimize=%s)', optimize => {
    expect(calculateCuttingTime([line(0, 0)], { materialThickness: 3, optimize }).totalTimeSec).toBe(0);
  });

  it('preserves explicit initial and final positioning with optimization', () => {
    const result = calculateCuttingTime([
      { ...line(0, 20), isCutting: false }, line(20, 40),
      { ...line(40, 0), isCutting: false }
    ], { materialThickness: 3, optimize: true });
    expect(result.movementDistance).toBe(60);
  });

  it('requires a measured flying-pierce duration', () => {
    expect(() => calculateCuttingTime([line(0, 10)], { materialThickness: 3, piercingType: 'flying' })).toThrow();
  });

  it.each([
    ['quadrado', 1000],
    ['redondo', 1000.0294934232859],
    ['LPEL-0040', 605.3893722612829],
    ['LPEL-1530', 474.51441738812116]
  ])('preserves analytic length of supplied %s.dxf within 0.01%%', (name, expected) => {
    const content = readFileSync(resolve(__dirname, `../../fixtures/drawings/${name}.dxf`), 'utf8');
    for (const optimize of [false, true]) {
      const result = calculateCuttingTimeFromDxf(content, { materialThickness: 3, optimize });
      expect(Math.abs(result.cuttingDistance - Number(expected)) / Number(expected)).toBeLessThan(0.0001);
    }
  });
});
