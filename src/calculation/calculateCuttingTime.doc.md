# calculateCuttingTime

## Visão geral
Motor de estimativa com unidades explícitas; [modelo e limites](../../docs/cutting-time-study.md).
## Responsabilidades
Validar, aplicar escala, ordenar contornos opcionalmente e somar os tempos.
## Entradas e saídas
`Movement[]` em mm e `CuttingTimeOptions`; retorna `CuttingTimeResult` em segundos/mm.
## Fluxo principal
Resolve parâmetros → seleciona Strategy temporal → escala → otimiza contornos
opcionalmente → corte/deslocamento → perfuração → setup único.
## Erros e casos-limite
Rejeita NaN, infinito, parâmetros negativos e espessura sem receita fora da tabela.
Vazio e cortes de comprimento zero não geram perfuração nem setup.
## Exemplos
`calculateCuttingTime(moves, { materialThickness: 3, cuttingSpeed: 3400, pierceTime: 0.03 })`.
## Dependências e integrações
[Resolver](./resolveCuttingParameters.ts), [Strategy](./createMovementTimeCalculator.ts),
[planejamento](./optimizeMovements.ts) e distância. O motor não importa formatos
nem I/O; os adaptadores usam a [Facade de desenho](./calculateDrawingTime.ts).
