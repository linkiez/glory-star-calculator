import { calculateCuttingTimeFromSvg } from '../../src';

const calculate = (body: string, attributes = '') => calculateCuttingTimeFromSvg(
  `<svg ${attributes} xmlns="http://www.w3.org/2000/svg">${body}</svg>`,
  { materialThickness: 3, kerf: 0 }
);

describe('SVG geometry', () => {
  it('handles relative commands and separate subpaths without cutting the gap', () => {
    const result = calculate('<path d="m0 0 h10 v10 z m30 0 l10 0"/>');
    expect(result.cuttingDistance).toBeCloseTo(30 + Math.hypot(10, 10), 5);
    expect(result.pierceCount).toBe(2);
    expect(result.movementDistance).toBeCloseTo(30, 5);
  });

  it('includes SVG arcs', () => {
    const result = calculate('<path d="M0 0 A10 10 0 0 1 20 0"/>');
    expect(result.cuttingDistance).toBeCloseTo(Math.PI * 10, 2);
  });

  it('includes Bezier curves instead of treating them as lines', () => {
    const result = calculate('<path d="M0 0 C0 100 100 100 100 0"/>');
    expect(result.cuttingDistance).toBeCloseTo(200, 2);
  });

  it('composes parent transforms and physical viewBox scaling', () => {
    const result = calculate(
      '<g transform="translate(10,20) scale(2)"><rect width="10" height="5"/></g>',
      'width="100mm" height="100mm" viewBox="0 0 1000 1000"'
    );
    expect(result.cuttingDistance).toBeCloseTo(6, 5);
    expect(result.cutAreaWidth).toBeCloseTo(2, 5);
    expect(result.cutAreaHeight).toBeCloseTo(1, 5);
  });

  it('uses zero defaults for omitted line coordinates', () => {
    expect(calculate('<line x2="10"/>').cuttingDistance).toBe(10);
  });

  it('does not cut definitions or hidden geometry', () => {
    const result = calculate('<defs><circle r="100"/></defs><g display="none"><rect width="100" height="100"/></g><line x2="10"/>');
    expect(result.cuttingDistance).toBe(10);
  });

  it('rejects unsupported use references instead of silently omitting cuts', () => {
    expect(() => calculate('<use href="#part"/>')).toThrow();
  });

  it('handles smooth quadratic and cubic commands', () => {
    const smooth = calculate('<path d="M0 0 Q10 20 20 0 T40 0 M50 0 C50 20 70 20 70 0 S90 -20 90 0"/>');
    const explicit = calculate('<path d="M0 0 Q10 20 20 0 Q30 -20 40 0 M50 0 C50 20 70 20 70 0 C70 -20 90 -20 90 0"/>');
    expect(smooth).toEqual(explicit);
  });

  it('does not cut from the previous endpoint after closepath', () => {
    const result = calculate('<path d="M0 0 L10 0 Z l0 10"/>');
    expect(result.cuttingDistance).toBe(30);
    expect(result.pierceCount).toBe(2);
  });

  it('retains legacy unitless CAD dimensions', () => {
    expect(calculate('<rect width="10" height="5"/>', 'width="100%" height="100%" viewBox="0 0 100 100"').cuttingDistance).toBe(30);
  });

  it('supports reflected/scaled matrices and circles with an analytic tolerance', () => {
    const result = calculate('<g transform="matrix(2,0,0,-2,50,30)"><circle r="10"/></g>');
    expect(Math.abs(result.cuttingDistance - 40 * Math.PI) / (40 * Math.PI)).toBeLessThan(0.0001);
    expect(result.pierceCount).toBe(1);
  });

  it.each(['M0 0 L', 'M0 0 W10 20', 'M0 0 A10 10 0 2 1 20 0'])('rejects malformed paths: %s', data => {
    expect(() => calculate(`<path d="${data}"/>`)).toThrow();
  });
});
