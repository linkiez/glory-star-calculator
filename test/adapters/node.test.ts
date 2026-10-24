import { readFileSync } from 'node:fs';
import { calculateCuttingTimeFromSvg } from '../../src';
import { calculateCuttingTimeFromFile, loadSvgFile } from '../../src/node';

jest.mock('node:fs', () => ({ readFileSync: jest.fn() }));

const svg = '<svg><rect width="100" height="50"/></svg>';
const options = { materialThickness: 3, optimize: true, scaleFactor: 2 };

beforeEach(() => jest.resetAllMocks());

describe('Node filesystem adapters', () => {
  it('loads UTF-8 text without altering it', () => {
    jest.mocked(readFileSync).mockReturnValue(svg);
    expect(loadSvgFile('drawing.svg')).toBe(svg);
    expect(readFileSync).toHaveBeenCalledWith('drawing.svg', 'utf8');
  });

  it('returns the same timing and scaled bounds as the universal SVG API', () => {
    jest.mocked(readFileSync).mockReturnValue(svg);
    expect(calculateCuttingTimeFromFile('drawing.svg', options))
      .toEqual(calculateCuttingTimeFromSvg(svg, options));
  });

  it('propagates filesystem errors instead of returning an estimate', () => {
    const failure = new Error('Falha de leitura');
    jest.mocked(readFileSync).mockImplementation(() => { throw failure; });
    expect(() => calculateCuttingTimeFromFile('missing.svg', options)).toThrow(failure);
  });

  it('propagates unsupported geometry from the shared SVG pipeline', () => {
    jest.mocked(readFileSync).mockReturnValue('<svg><use href="#part"/></svg>');
    expect(() => calculateCuttingTimeFromFile('unsupported.svg', options)).toThrow();
  });
});
