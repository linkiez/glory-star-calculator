# getLaserTechnologyOptions

## Visão geral
Seleção explícita de uma receita no CSV.
## Responsabilidades
Validar estrutura, localizar CODE único e converter tempo para segundos.
## Entradas e saídas
Texto CSV e `{ code, cutProfile, pierceProfile, pierceTimeUnit }`; retorna
`{ materialThickness, cuttingSpeed, pierceTime }`.
## Fluxo principal
[Parser CSV](./parseTechnologyCsv.ts) com aspas/BOM/CRLF → validação → seleção →
parâmetros numéricos. O contrato público está em [TechnologySelection](./TechnologySelection.ts).
## Erros e casos-limite
Rejeita receitas ausentes/duplicadas, feeds zero, colunas faltantes, linhas com
tamanho divergente e números inválidos. A unidade é obrigatória: `s`, `ms` ou `cs`.
Não infere material/gás nem soma perfis de perfuração. Sem I/O de arquivo.
## Exemplos
CODE 3030, corte A, perfuração A e `ms`: 3 mm, 3400 mm/min, 0,03 s.
## Dependências e integrações
Tabela fornecida pelo consumidor; API exportada por `index.ts`.
Veja as [incertezas das unidades](../../docs/cutting-time-study.md#db_lasercsv-seleção-e-incertezas).
