# processSvg

## Visão geral
Importação SVG sem DOM, com transformações e escala de viewport.
## Responsabilidades
Filtrar elementos não cortáveis e transformar pontos para mm.
## Entradas e saídas
String SVG; `ProcessedSVGElement[]`, um elemento por subpath.
## Fluxo principal
`svg-parser` → viewport → matrizes hierárquicas → formas/paths → pontos transformados.
## Erros e casos-limite
Valores inválidos, `use`, viewports aninhados, máscaras, recortes e CSS geométrico
não suportado geram erro. Definições, texto e elementos explicitamente ocultos
não cortam. Comprimentos geométricos devem ser numéricos nas unidades do desenho.
Regras de unidades físicas e CAD estão no [README](../../../README.md#precisão-e-limites).
## Exemplos
`<g transform="scale(2)"><line x2="10"/></g>` produz comprimento 20 nas unidades locais.
## Dependências e integrações
`svg-parser`, matrizes SVG.js e [svgPathElements](./svgPathElements.doc.md).
