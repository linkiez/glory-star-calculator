# Contratos públicos

## Visão geral
Barrel de compatibilidade dos contratos de geometria e cálculo.
## Responsabilidades
Reexportar tipos e enum sem declarações duplicadas.
## Entradas e saídas
Pontos, movimentos, opções, resultados e elementos SVG.
## Fluxo principal
Importação → modelos e contratos do formato SVG.
## Erros e casos-limite
Tipos não validam entradas em runtime; o motor e os parsers validam os dados.
## Exemplos
`import type { Movement } from './types';`
## Dependências e integrações
[Modelos](./models/) e [formato SVG](./formats/svg/).
