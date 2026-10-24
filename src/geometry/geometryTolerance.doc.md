# GEOMETRY_TOLERANCE

## Visão geral
Tolerância absoluta compartilhada para continuidade geométrica em mm.
## Responsabilidades
Evitar critérios distintos de conexão e fechamento entre formatos e cálculo.
## Entradas e saídas
Constante numérica positiva; não recebe entradas.
## Fluxo principal
Consumidores comparam a distância entre extremidades com a tolerância.
## Erros e casos-limite
Não corrige desenhos nem une pontos arbitrariamente; escala e unidades são
responsabilidade de cada etapa de processamento.
## Exemplos
`const connected = calculateDistance(start, end) <= GEOMETRY_TOLERANCE;`
## Dependências e integrações
DXF, conversão SVG, otimização e motor; sem dependências.
