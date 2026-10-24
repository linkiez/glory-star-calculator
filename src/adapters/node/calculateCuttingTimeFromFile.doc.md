# calculateCuttingTimeFromFile

## Visão geral
Adapter entre um caminho de arquivo SVG e o cálculo universal.
## Responsabilidades
Compor leitura e interpretação sem manter regras próprias de geometria ou tempo.
## Entradas e saídas
Caminho e `CuttingTimeOptions` → `CuttingTimeResult`.
## Fluxo principal
[loadSvgFile](./loadSvgFile.ts) → [calculateCuttingTimeFromSvg](../../formats/svg/calculateCuttingTimeFromSvg.ts).
## Erros e casos-limite
Propaga erros de arquivo, SVG e parâmetros; o resultado coincide com a API de string.
## Exemplos
`calculateCuttingTimeFromFile('/drawings/part.svg', { materialThickness: 3 });`
## Dependências e integrações
Reexportado pela [API Node](../../node.ts); mantém I/O fora do motor.
