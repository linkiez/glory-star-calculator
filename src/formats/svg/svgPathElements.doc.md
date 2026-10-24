# svgPathElements

## Visão geral
Interpretação de caminhos SVG completos.
## Responsabilidades
Preservar subpaths e aproximar curvas sem perder movimentos.
## Entradas e saídas
Atributo `d`; lista de elementos com pontos e fechamento.
## Fluxo principal
SVG.js normaliza relativos → comandos → curvas adaptativas/arcos → subpaths.
## Erros e casos-limite
Comandos incompletos, flags inválidas e coordenadas não finitas geram erro.
Bézier usa subdivisão por excesso de comprimento do polígono de controle;
arcos usam passos de até 0,5°. `Z` retorna ao início do subpath, não do documento.
## Exemplos
`M0 0 A10 10 0 0 1 20 0` representa semicírculo de aproximadamente 31,415927 unidades.
## Dependências e integrações
`PathArray` da dependência SVG.js; fórmulas W3C citadas no [estudo](../../../docs/cutting-time-study.md).
