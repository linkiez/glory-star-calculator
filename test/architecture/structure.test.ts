import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import ts from 'typescript';

const sourceRoot = resolve(process.cwd(), 'src');

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : path.endsWith('.ts') ? [path] : [];
  });
}

describe('Library architecture', () => {
  it('keeps only library entrypoints at the source root', () => {
    expect(readdirSync(sourceRoot).filter(name => /\.[^.]+$/.test(name)).sort()).toEqual([
      'index.doc.md', 'index.ts', 'node.doc.md', 'node.ts'
    ]);
  });

  it('keeps calculation independent of drawing parsers and Node I/O', () => {
    const calculationRoot = join(sourceRoot, 'calculation');
    expect(existsSync(calculationRoot)).toBe(true);
    for (const file of sourceFiles(calculationRoot)) {
      const content = readFileSync(file, 'utf8');
      expect(content).not.toMatch(/from ['"][^'"]*(?:formats|adapters|node:|dxf-parser|svg-parser)/);
    }
  });

  it('resolves relative module imports without circular dependencies', () => {
    const graph = new Map<string, string[]>();
    for (const file of sourceFiles(sourceRoot)) {
      const parsed = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      const dependencies: string[] = [];
      for (const statement of parsed.statements) {
        if ((ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
            statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
          const specifier = statement.moduleSpecifier.text;
          if (!specifier.startsWith('.')) continue;
          const direct = resolve(dirname(file), `${specifier}.ts`);
          const target = existsSync(direct) ? direct : resolve(dirname(file), specifier, 'index.ts');
          expect(existsSync(target)).toBe(true);
          dependencies.push(target);
        }
      }
      graph.set(file, dependencies);
    }
    function visit(file: string, ancestors: Set<string>): void {
      expect(ancestors.has(file)).toBe(false);
      const path = new Set([...ancestors, file]);
      for (const dependency of graph.get(file) ?? []) visit(dependency, path);
    }
    for (const file of graph.keys()) visit(file, new Set());
  });

  it('keeps one declaration export per module and documents each implementation', () => {
    for (const file of sourceFiles(sourceRoot)) {
      const parsed = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      const declarations = parsed.statements.filter(statement =>
        !ts.isExportDeclaration(statement) &&
        ts.canHaveModifiers(statement) &&
        ts.getModifiers(statement)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)
      );
      expect(declarations.length).toBeLessThanOrEqual(1);
      expect(existsSync(file.replace(/\.ts$/, '.doc.md'))).toBe(true);
      expect(parsed.text.split('\n').length).toBeLessThanOrEqual(500);
    }
  });
});
