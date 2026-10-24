# CuttingTimeResult

## Visão geral
Decomposição aditiva de tempo e distância de um trabalho.
## Responsabilidades
Expor corte, viagem, perfuração, setup e contagem de contornos.
## Entradas e saídas
Tempos em segundos; distâncias e dimensões opcionais da área em mm.
## Fluxo principal
O motor agrega valores; a Facade de desenho acrescenta `cutAreaWidth` e `cutAreaHeight`.
## Erros e casos-limite
`partCount` mantém significado de contornos, não identifica peças físicas.
Desenho vazio tem totais zero; dimensões só existem quando há corte.
## Exemplos
`const seconds = result.cuttingTimeSec + result.movementTimeSec + result.piercingTimeSec + result.setupTimeSec;`
## Dependências e integrações
[Motor](../calculation/calculateCuttingTime.ts) e [limites](../geometry/withCutBounds.ts).
