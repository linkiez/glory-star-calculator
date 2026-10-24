# MIN_DISTANCE_FOR_ACCELERATION

## Visão geral
Limiar em mm para overhead no modelo de referência.
## Responsabilidades
Centralizar a elegibilidade de contornos e viagens para o overhead.
## Entradas e saídas
Constante numérica; consumidores comparam a distância completa.
## Fluxo principal
A Strategy de referência aplica overhead quando a distância atinge o limiar.
## Erros e casos-limite
Não é usado no perfil físico triangular/trapezoidal.
## Exemplos
`const eligible = distance >= MIN_DISTANCE_FOR_ACCELERATION;`
## Dependências e integrações
[Strategy](../../calculation/createMovementTimeCalculator.ts).
