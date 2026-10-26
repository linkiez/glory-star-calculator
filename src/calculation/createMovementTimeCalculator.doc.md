# createMovementTimeCalculator

## Visão geral
Strategy funcional selecionada uma vez por trabalho.
## Responsabilidades
Escolher entre referência com overhead e aceleração triangular/trapezoidal.
## Entradas e saídas
Aceleração em mm/s² ou overhead do perfil selecionado → função
`(distance, feed) => seconds`, em mm e mm/min.
## Fluxo principal
Sem aceleração, exige overhead do próprio perfil e usa distância/feed com esse overhead.
Com aceleração, compara distância com `v²/a` e aplica perfil triangular ou trapezoidal.
## Erros e casos-limite
Distância zero retorna zero; parâmetros devem estar validados pelo
[resolver](./resolveCuttingParameters.ts). Não simula jerk nem reduções em cantos.
Ausência de aceleração e de modelo de referência gera erro, não fallback Glory Star.
## Exemplos
`const seconds = createMovementTimeCalculator(1000, undefined)(100, 6000);`
## Dependências e integrações
[MachineProfile](../technology/profiles/MachineProfile.ts); referências são recebidas
do resolver em vez de lidas de constantes globais.
