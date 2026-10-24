# API de processamento SVG

## Visão geral
Barrel de compatibilidade do processamento geométrico SVG.
## Responsabilidades
Expor interpretação e conversão sem duplicar algoritmos.
## Entradas e saídas
Texto SVG → elementos processados → movimentos.
## Fluxo principal
Importação → API principal → processador e conversor.
## Erros e casos-limite
Propaga erros explícitos em recursos não suportados.
## Exemplos
`import { processSvg } from './svgProcessor';`
## Dependências e integrações
[API principal](./index.ts) e [formato SVG](./formats/svg/).
