# createMovementTimeCalculator

## Visão geral
Strategy funcional selecionada uma vez por trabalho.
## Responsabilidades
Escolher entre referência com overhead e aceleração triangular/trapezoidal.
## Entradas e saídas
Aceleração opcional em mm/s² → função `(distance, feed) => seconds`, em mm e mm/min.
## Fluxo principal
Sem aceleração, usa distância/feed e overhead por movimento elegível.
Com aceleração, compara distância com `v²/a` e aplica perfil triangular ou trapezoidal.
## Erros e casos-limite
Distância zero retorna zero; parâmetros devem estar validados pelo
[resolver](./resolveCuttingParameters.ts). Não simula jerk nem reduções em cantos.
## Exemplos
`const seconds = createMovementTimeCalculator(1000)(100, 6000);`
## Dependências e integrações
[accelerationTime](../technology/reference/accelerationTime.ts) e
[minDistanceForAcceleration](../technology/reference/minDistanceForAcceleration.ts).
