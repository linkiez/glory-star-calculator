# API Node.js

## Visão geral
Entrada específica para operações de arquivo, separada da API universal.
## Responsabilidades
Reexportar `loadSvgFile` e `calculateCuttingTimeFromFile`, sem duplicar cálculo.
## Entradas e saídas
Caminho de SVG e opções; texto UTF-8 ou estimativa em segundos e mm.
## Fluxo principal
Consumidor → adaptadores Node → leitura de arquivo → processamento SVG.
## Erros e casos-limite
Propaga falhas de leitura, geometria e parâmetros; não retorna estimativas parciais.
## Exemplos
`import { loadSvgFile } from '@linkiez/glory-star-calculator/dist/node'`.
## Dependências e integrações
[Adaptadores Node](./adapters/node/) e `node:fs`; não deve ser importada em browsers.
