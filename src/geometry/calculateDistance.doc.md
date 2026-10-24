# calculateDistance

## Visão geral
Distância euclidiana 2D.
## Responsabilidades
Validar coordenadas e calcular `Math.hypot`.
## Entradas e saídas
Dois `Point`; distância na unidade dos pontos.
## Fluxo principal
Validação de finitude → diferença → norma euclidiana.
## Erros e casos-limite
Coordenadas inválidas ou overflow geram erro; pontos idênticos retornam zero.
## Exemplos
`calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 })` retorna 5.
## Dependências e integrações
Usado pelo motor e pelos importadores geométricos.
