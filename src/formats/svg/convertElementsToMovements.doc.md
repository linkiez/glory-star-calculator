# convertElementsToMovements

## Visão geral
Conversão de subpaths em movimentos.
## Responsabilidades
Preservar fechamento e limites explícitos de perfuração.
## Entradas e saídas
Elementos SVG processados; `Movement[]`.
## Fluxo principal
Posicionar até o início → cortar segmentos → fechar quando necessário.
## Erros e casos-limite
Elementos sem segmentos são ignorados. Contornos que se tocam permanecem separados.
Posição inicial SVG é (0,0), antes do primeiro deslocamento.
## Exemplos
Dois paths separados geram duas perfurações, inclusive com endpoints coincidentes.
## Dependências e integrações
`processSvg`, distância euclidiana e
[tolerância de fechamento compartilhada](../../geometry/geometryTolerance.ts).
