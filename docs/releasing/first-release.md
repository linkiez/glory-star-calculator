# Guia de Primeiro Release

Este guia explica como fazer o primeiro release usando semantic-release após configurar o projeto.

## Pré-requisitos

1. **GitHub Token**: O GitHub Actions já possui acesso ao `GITHUB_TOKEN` automaticamente
2. **Permissões**: O workflow já está configurado com as permissões necessárias
3. **Branch protegido**: Certifique-se de que o branch `main` está configurado

## Passo a Passo

### 1. Verificar Configurações

Certifique-se de que os seguintes arquivos foram criados:

- ✅ `.releaserc.json` - Configuração do semantic-release
- ✅ `.github/workflows/release.yml` - Workflow do GitHub Actions
- ✅ `package.json` - Atualizado com repository e publishConfig

### 2. Fazer Commit Seguindo Conventional Commits

O semantic-release determina a versão baseado nos commits. Use o formato correto:

```bash
# Para uma correção (patch: 1.4.2 -> 1.4.3)
git commit -m "fix: corrigir cálculo de tempo para círculos"

# Para uma nova funcionalidade (minor: 1.4.2 -> 1.5.0)
git commit -m "feat: adicionar suporte para arquivos DXF"

# Para breaking change (major: 1.4.2 -> 2.0.0)
git commit -m "feat!: alterar interface principal da API

BREAKING CHANGE: Método calculate() agora retorna Promise"
```

### 3. Push para Main

```bash
git push origin main
```

### 4. Acompanhar o Workflow

1. Acesse: <https://github.com/linkiez/glory-star-calculator/actions>
2. Verifique o workflow "Release"
3. O workflow irá:
   - ✅ Instalar dependências
   - ✅ Rodar testes
   - ✅ Fazer build
   - ✅ Analisar commits
   - ✅ Determinar próxima versão
   - ✅ Atualizar `package.json` e `CHANGELOG.md`
   - ✅ Criar tag e release no GitHub
   - ✅ Publicar no GitHub Packages

### 5. Verificar Publicação

Após o workflow concluir:

1. **GitHub Release**: <https://github.com/linkiez/glory-star-calculator/releases>
2. **GitHub Packages**: <https://github.com/linkiez/glory-star-calculator/packages>

## Formato de Commits

### Tipos de Commits

| Tipo | Descrição | Versão |
| ---- | --------- | ------ |
| `feat:` | Nova funcionalidade | Minor (1.x.0) |
| `fix:` | Correção de bug | Patch (1.0.x) |
| `perf:` | Melhoria de performance | Patch (1.0.x) |
| `docs:` | Apenas documentação | Sem versão |
| `style:` | Formatação, espaços | Sem versão |
| `refactor:` | Refatoração de código | Sem versão |
| `test:` | Testes | Sem versão |
| `chore:` | Tarefas gerais | Sem versão |

### Breaking Changes

Para indicar uma mudança que quebra compatibilidade:

**Opção 1**: Usar `!` após o tipo

```bash
git commit -m "feat!: remover método deprecated"
```

**Opção 2**: Adicionar `BREAKING CHANGE:` no corpo

```bash
git commit -m "feat: novo sistema de autenticação

BREAKING CHANGE: A API de autenticação foi completamente redesenhada"
```

## Exemplo de Fluxo Completo

```bash
# 1. Fazer alterações no código
vim src/calculation/calculateCuttingTime.ts

# 2. Adicionar arquivos
git add src/calculation/calculateCuttingTime.ts src/calculation/calculateCuttingTime.doc.md

# 3. Commit seguindo conventional commits
git commit -m "feat: adicionar suporte para corte circular otimizado"

# 4. Push para main
git push origin main

# 5. O GitHub Actions fará automaticamente:
#    - Testes
#    - Build
#    - Versionar (1.4.2 -> 1.5.0)
#    - Publicar no GitHub Packages
#    - Criar release no GitHub
```

## Instalando o Pacote Publicado

Após a publicação, os usuários podem instalar:

```bash
# Configurar registry
echo "@linkiez:registry=https://npm.pkg.github.com" >> .npmrc

# Adicionar token (requer GitHub token com read:packages)
echo "//npm.pkg.github.com/:_authToken=YOUR_TOKEN" >> .npmrc

# Instalar
npm install @linkiez/glory-star-calculator
# ou
yarn add @linkiez/glory-star-calculator
```

## Troubleshooting

### Workflow falha ao publicar

**Problema**: Erro de autenticação ao publicar
**Solução**: Verifique se o `GITHUB_TOKEN` tem permissões de `packages: write`

### Versão não é incrementada

**Problema**: Semantic-release não cria nova versão
**Solução**:

- Verifique se os commits seguem o formato Conventional Commits
- Commits como `chore:`, `docs:`, `style:` não geram nova versão
- Use `feat:` ou `fix:` para gerar versão

### Package não aparece no GitHub Packages

**Problema**: Package não aparece após publicação
**Solução**:

- Verifique o workflow no Actions
- Confirme que o `publishConfig` está correto no package.json
- Verifique se o nome do pacote tem o scope correto (`@linkiez/`)

## Recursos Adicionais

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [GitHub Packages](https://docs.github.com/en/packages)
- [GitHub Actions](https://docs.github.com/en/actions)

## Próximos Passos

Após o primeiro release bem-sucedido:

1. ✅ Verificar se o CHANGELOG.md foi criado automaticamente
2. ✅ Confirmar que a tag foi criada no GitHub
3. ✅ Testar instalação do pacote publicado
4. ✅ Atualizar documentação se necessário
