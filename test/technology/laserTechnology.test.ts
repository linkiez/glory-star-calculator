import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getLaserTechnologyOptions } from '../../src/technology/getLaserTechnologyOptions';
import { calculateCuttingTime } from '../../src';

describe('Machine technology selection', () => {
  const csv = readFileSync(resolve(__dirname, '../../src/DB_Laser.csv'), 'utf8');

  it('selects a unique recipe and explicitly converts milliseconds to seconds', () => {
    const options = getLaserTechnologyOptions(csv, {
      code: '3030', cutProfile: 'A', pierceProfile: 'A', pierceTimeUnit: 'ms'
    });
    expect(options).toMatchObject({ materialThickness: 3, cuttingSpeed: 3400, pierceTime: 0.03 });
    const result = calculateCuttingTime([
      { start: { x: 0, y: 0 }, end: { x: 3400, y: 0 }, isCutting: true }
    ], { ...options, setupTimeSec: 0 });
    expect(result.cuttingTimeSec).toBeCloseTo(60.2, 6);
    expect(result.piercingTimeSec).toBe(0.03);
  });

  it('does not mix different materials at the same thickness', () => {
    const select = (code: string) => getLaserTechnologyOptions(csv, {
      code, cutProfile: 'A', pierceProfile: 'A', pierceTimeUnit: 'ms'
    });
    expect(select('3030').cuttingSpeed).toBe(3400);
    expect(select('2003').cuttingSpeed).toBe(4500);
  });

  it('requires an explicit existing code', () => {
    expect(() => getLaserTechnologyOptions(csv, {
      code: 'missing', cutProfile: 'A', pierceProfile: 'A', pierceTimeUnit: 'ms'
    })).toThrow();
  });

  it('rejects a disabled feed instead of returning a zero cutting time', () => {
    expect(() => getLaserTechnologyOptions(csv, {
      code: '1020', cutProfile: 'B', pierceProfile: 'A', pierceTimeUnit: 'ms'
    })).toThrow();
  });

  it.each([['s', 30], ['ms', 0.03], ['cs', 0.3]] as const)('supports explicit %s units', (pierceTimeUnit, seconds) => {
    expect(getLaserTechnologyOptions(csv, {
      code: '3030', cutProfile: 'A', pierceProfile: 'A', pierceTimeUnit
    }).pierceTime).toBe(seconds);
  });

  it('supports BOM, CRLF, quoted commas, escaped quotes and multiline fields', () => {
    const options = getLaserTechnologyOptions('\uFEFFCODE,TH,A_CUT_FEED,A_PIERCE_TIME,NOTE\r\n3030,3,3400,30,"a,b ""quote""\r\nnext"\r\n', {
      code: '3030', cutProfile: 'A', pierceProfile: 'A', pierceTimeUnit: 'ms'
    });
    expect(options.pierceTime).toBe(0.03);
  });

  it.each([
    'CODE,TH,A_CUT_FEED,A_PIERCE_TIME\n1,3,3400,30\n1,3,2000,20',
    'CODE,TH,A_CUT_FEED,A_PIERCE_TIME\n1,3,3400',
    'CODE,TH,A_CUT_FEED,A_PIERCE_TIME\n1,3,3400,"30',
    'CODE,TH,TH,A_CUT_FEED,A_PIERCE_TIME\n1,3,3,3400,30',
    'CODE,TH,A_CUT_FEED,A_PIERCE_TIME\n1,3,NaN,30',
    'CODE,TH,A_CUT_FEED,A_PIERCE_TIME\n1,3,3400,"30"x',
    'CODE,TH,A_CUT_FEED\n1,3,3400'
  ])('rejects ambiguous or malformed recipe data', invalid => {
    expect(() => getLaserTechnologyOptions(invalid, {
      code: '1', cutProfile: 'A', pierceProfile: 'A', pierceTimeUnit: 'ms'
    })).toThrow();
  });
});
