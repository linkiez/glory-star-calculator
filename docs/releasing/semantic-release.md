# Semantic Release Configuration

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated version management and package publishing.

## Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature (triggers minor version bump)
- `fix:` - Bug fix (triggers patch version bump)
- `chore:` - Maintenance tasks (no version bump)
- `docs:` - Documentation changes (no version bump)
- `style:` - Code style changes (no version bump)
- `refactor:` - Code refactoring (no version bump)
- `perf:` - Performance improvements (triggers patch version bump)
- `test:` - Test changes (no version bump)

### Breaking Changes

Add `BREAKING CHANGE:` in the commit body or use `!` after the type to trigger a major version bump:

```text
feat!: change API interface

BREAKING CHANGE: The API interface has been completely redesigned
```

## Examples

```bash
# Patch release (1.4.2 -> 1.4.3)
git commit -m "fix: corrigir cálculo de tempo para círculos"

# Minor release (1.4.2 -> 1.5.0)
git commit -m "feat: adicionar suporte para arquivos DXF"

# Major release (1.4.2 -> 2.0.0)
git commit -m "feat!: alterar interface principal da API

BREAKING CHANGE: Método calculate() agora retorna Promise"
```

## Workflow

1. Make your changes
2. Commit using conventional commits format
3. Push to main branch
4. GitHub Actions will:
   - Run tests
   - Build the project
   - Determine next version based on commits
   - Update package.json and CHANGELOG.md
   - Create a GitHub release
   - Publish to GitHub Packages

## Installation from GitHub Packages

To install this package from GitHub Packages, create a `.npmrc` file in your project:

```text
@linkiez:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then install:

```bash
npm install @linkiez/glory-star-calculator
```

Or with yarn:

```bash
yarn add @linkiez/glory-star-calculator
```
