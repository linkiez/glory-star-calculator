# Point

## Visão geral
Contrato de coordenada cartesiana planar.
## Responsabilidades
Representar posição sem acoplamento ao formato de origem.
## Entradas e saídas
Propriedades numéricas `x` e `y`, em mm no motor.
## Fluxo principal
Parsers normalizam unidades e geram pontos; cálculo aplica a escala geométrica.
## Erros e casos-limite
O tipo não valida em runtime; o cálculo rejeita coordenadas não finitas.
## Exemplos
`const point: Point = { x: 10, y: 20 };`
## Dependências e integrações
Sem dependências; usado por [Movement](./Movement.ts) e geometria.
