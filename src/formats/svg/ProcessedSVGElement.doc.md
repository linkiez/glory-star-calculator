# ProcessedSVGElement

## Visão geral
Contrato de um subpath SVG convertido em geometria planar.
## Responsabilidades
Separar interpretação do SVG da criação dos movimentos.
## Entradas e saídas
Tipo de elemento, lista de pontos e flag `isClosed`.
## Fluxo principal
O processador aplica transformações e tessela curvas; o conversor gera movimentos.
## Erros e casos-limite
Subpaths independentes não devem ser unidos como um único contorno.
## Exemplos
`const element: ProcessedSVGElement = { type: SVGElementType.Line, points: [{ x: 0, y: 0 }, { x: 1, y: 0 }], isClosed: false };`
## Dependências e integrações
[Point](../../models/Point.ts) e [SVGElementType](./SVGElementType.ts).
