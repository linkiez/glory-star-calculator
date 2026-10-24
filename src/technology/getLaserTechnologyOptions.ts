import type { CuttingTimeOptions } from '../models/CuttingTimeOptions';
import type { TechnologySelection } from './TechnologySelection';
import { parseTechnologyCsv } from './parseTechnologyCsv';

/**
 * Reads one exact CODE and chosen cut/pierce profiles from a supplied DB_Laser CSV string.
 * @param csv - Exported technology table; no implicit file I/O or bundled private recipes.
 * @param selection - Exact recipe, profiles and explicitly confirmed piercing time unit.
 * @returns Calculator options with feed in mm/min and piercing time in seconds.
 * @throws Error for missing/ambiguous recipes, malformed CSV or inactive process parameters.
 */
export function getLaserTechnologyOptions(csv: string, selection: TechnologySelection): CuttingTimeOptions {
  if (!['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L'].includes(selection.cutProfile) ||
      !['A', 'B', 'C', 'D', 'E', 'F'].includes(selection.pierceProfile)) throw new Error('Perfil de tecnologia inválido');
  const units: Record<string, number> = { s: 1, ms: 0.001, cs: 0.01 };
  const unit = units[selection.pierceTimeUnit];
  if (unit === undefined) throw new Error('Informe a unidade do tempo de perfuração: s, ms ou cs');
  const [header, ...rows] = parseTechnologyCsv(csv);
  if (!header || new Set(header).size !== header.length) throw new Error('Cabeçalho CSV ausente ou duplicado');
  const column = (name: string): number => {
    const index = header.indexOf(name);
    if (index < 0) throw new Error(`Coluna ausente no CSV: ${name}`);
    return index;
  };
  const codeColumn = column('CODE');
  if (rows.some(row => row.length !== header.length)) throw new Error('CSV com quantidade de colunas inconsistente');
  const matches = rows.filter(row => row[codeColumn].trim() === selection.code);
  if (matches.length !== 1) throw new Error(`CODE deve identificar exatamente uma receita: ${selection.code}`);
  const selected = matches[0];
  function numeric(name: string, positive: boolean): number {
    const raw = selected[column(name)].trim();
    const value = Number(raw);
    if (!raw || !Number.isFinite(value) || (positive ? value <= 0 : value < 0)) {
      throw new Error(`Parâmetro inválido ou desativado na receita ${selection.code}: ${name}`);
    }
    return value;
  }
  return {
    materialThickness: numeric('TH', true),
    cuttingSpeed: numeric(`${selection.cutProfile}_CUT_FEED`, true),
    pierceTime: numeric(`${selection.pierceProfile}_PIERCE_TIME`, false) * unit
  };
}
