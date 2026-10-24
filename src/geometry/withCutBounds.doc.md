# withCutBounds

## Visão geral
Dimensões da geometria de corte.
## Responsabilidades
Obter extremos sem incluir deslocamentos.
## Entradas e saídas
Resultado, movimentos validados e escala; resultado com largura/altura em mm.
## Fluxo principal
Extremos dos pontos de corte → diferença máxima/mínima → escala.
## Erros e casos-limite
Sem corte, não inclui dimensões; leads sem geometria não ampliam a área.
## Exemplos
Linha de (0,0) a (3,4), escala 2: largura 6 e altura 8.
## Dependências e integrações
Adaptadores SVG/DXF; curvas usam pontos aproximados dos importadores.
