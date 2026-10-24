/**
 * Parses the technology export with quoted cells, escaped quotes, BOM and CRLF support.
 * @param csv - Technology table text.
 * @returns Non-empty rows with original cell content preserved.
 * @throws Error for malformed or unterminated quoting.
 */
export function parseTechnologyCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false, closed = false;
  const text = csv.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else { quoted = false; closed = true; }
      } else cell += char;
    } else if (char === ',' || char === '\n' || char === '\r') {
      row.push(cell);
      cell = ''; closed = false;
      if (char !== ',') {
        if (row.some(value => value.length > 0)) rows.push(row);
        row = [];
        if (char === '\r' && text[i + 1] === '\n') i++;
      }
    } else if (char === '"' && cell === '' && !closed) quoted = true;
    else {
      if (closed || char === '"') throw new Error('Aspas inválidas no CSV de tecnologia');
      cell += char;
    }
  }
  if (quoted) throw new Error('CSV de tecnologia com aspas não fechadas');
  if (cell.length || row.length || closed) { row.push(cell); rows.push(row); }
  return rows;
}
