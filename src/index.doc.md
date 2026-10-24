# API pública

## Visão geral
Ponto de entrada do pacote.
## Responsabilidades
Reexportar tipos, constantes, cálculo, SVG e seleção de receita.
## Entradas e saídas
Funções disponíveis via `@linkiez/glory-star-calculator`.
## Fluxo principal
Consumidor → reexports → implementação correspondente.
## Erros e casos-limite
Não captura erros dos módulos; não lê automaticamente o CSV privado.
## Exemplos
`import { getLaserTechnologyOptions, calculateCuttingTimeFromDxf } from '@linkiez/glory-star-calculator'`.
## Dependências e integrações
O build TypeScript gera `dist/index.js` e declarações para publicação.
