import { calculateCuttingTimeFromDxf } from '../../src';

function dxf(entities: string): string {
  return `0\nSECTION\n2\nENTITIES\n${entities}0\nENDSEC\n0\nEOF\n`;
}

describe('DXF geometry regression', () => {
  it('uses radians returned by dxf-parser for a quarter circle', () => {
    const result = calculateCuttingTimeFromDxf(
      dxf('0\nARC\n10\n0\n20\n0\n40\n10\n50\n0\n51\n90\n'),
      { materialThickness: 3, kerf: 0 }
    );
    expect(result.cuttingDistance).toBeCloseTo(5 * Math.PI, 2);
    expect(result.cutAreaWidth).toBeCloseTo(10, 4);
    expect(result.cutAreaHeight).toBeCloseTo(10, 4);
  });

  it('closes polylines using the parser shape flag', () => {
    const result = calculateCuttingTimeFromDxf(
      dxf('0\nLWPOLYLINE\n90\n3\n70\n1\n10\n0\n20\n0\n10\n3\n20\n0\n10\n3\n20\n4\n'),
      { materialThickness: 3, kerf: 0 }
    );
    expect(result.cuttingDistance).toBeCloseTo(12, 5);
  });

  it('includes bulge arcs rather than their chords', () => {
    const result = calculateCuttingTimeFromDxf(
      dxf('0\nLWPOLYLINE\n90\n2\n70\n0\n10\n0\n20\n0\n42\n1\n10\n20\n20\n0\n'),
      { materialThickness: 3, kerf: 0 }
    );
    expect(result.cuttingDistance).toBeCloseTo(10 * Math.PI, 2);
  });

  it('scales dimensions along with cutting length', () => {
    const result = calculateCuttingTimeFromDxf(
      dxf('0\nLINE\n10\n0\n20\n0\n11\n3\n21\n4\n'),
      { materialThickness: 3, kerf: 0, scaleFactor: 2 }
    );
    expect(result.cuttingDistance).toBe(10);
    expect(result.cutAreaWidth).toBe(6);
    expect(result.cutAreaHeight).toBe(8);
  });

  it('uses declared inch units', () => {
    const content = '0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n1\n0\nENDSEC\n' +
      dxf('0\nLINE\n10\n0\n20\n0\n11\n1\n21\n0\n');
    const result = calculateCuttingTimeFromDxf(content, { materialThickness: 3 });
    expect(result.cuttingDistance).toBe(25.4);
    expect(result.cutAreaWidth).toBe(25.4);
  });

  it('joins unordered open contours at either endpoint', () => {
    const result = calculateCuttingTimeFromDxf(dxf(
      '0\nLINE\n10\n10\n20\n0\n11\n20\n21\n0\n0\nLINE\n10\n0\n20\n0\n11\n10\n21\n0\n'
    ), { materialThickness: 3 });
    expect(result.cuttingDistance).toBe(20);
    expect(result.pierceCount).toBe(1);
  });

  it('handles arcs crossing zero degrees', () => {
    const result = calculateCuttingTimeFromDxf(
      dxf('0\nARC\n10\n0\n20\n0\n40\n10\n50\n270\n51\n90\n'), { materialThickness: 3 }
    );
    expect(result.cuttingDistance).toBeCloseTo(10 * Math.PI, 2);
    expect(result.cutAreaWidth).toBeCloseTo(10, 4);
    expect(result.cutAreaHeight).toBeCloseTo(20, 4);
  });

  it('applies INSERT translation, rotation, scale and block base point', () => {
    const blocks = '0\nSECTION\n2\nBLOCKS\n0\nBLOCK\n2\npart\n10\n5\n20\n0\n' +
      '0\nLINE\n10\n5\n20\n0\n11\n15\n21\n0\n0\nENDBLK\n0\nENDSEC\n';
    const content = blocks + dxf('0\nINSERT\n2\npart\n10\n100\n20\n50\n41\n2\n42\n3\n50\n90\n');
    const result = calculateCuttingTimeFromDxf(content, { materialThickness: 3 });
    expect(result.cuttingDistance).toBeCloseTo(20, 5);
    expect(result.cutAreaWidth).toBeCloseTo(0, 5);
    expect(result.cutAreaHeight).toBeCloseTo(20, 5);
  });

  it('rejects cyclic blocks instead of indefinitely expanding them', () => {
    const blocks = '0\nSECTION\n2\nBLOCKS\n0\nBLOCK\n2\npart\n10\n0\n20\n0\n' +
      '0\nINSERT\n2\npart\n10\n0\n20\n0\n0\nENDBLK\n0\nENDSEC\n';
    expect(() => calculateCuttingTimeFromDxf(
      blocks + dxf('0\nINSERT\n2\npart\n10\n0\n20\n0\n'), { materialThickness: 3 }
    )).toThrow(/recursivo/);
  });
});
