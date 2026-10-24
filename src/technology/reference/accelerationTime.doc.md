# ACCELERATION_TIME

## Visão geral
Overhead temporal de referência em segundos.
## Responsabilidades
Preservar a referência quando a aceleração real não é informada.
## Entradas e saídas
Constante numérica, aplicada por contorno ou deslocamento elegível.
## Fluxo principal
A Strategy de referência soma o overhead acima do limiar geométrico.
## Erros e casos-limite
Não deve ser aplicado por segmento de tesselação; não é uma aceleração física.
## Exemplos
`const overheadSeconds = ACCELERATION_TIME;`
## Dependências e integrações
[Strategy](../../calculation/createMovementTimeCalculator.ts).
