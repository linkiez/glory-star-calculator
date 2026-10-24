# calculateCuttingTimeFromSvg

## Visão geral
Adaptador público SVG → estimativa.
## Responsabilidades
Integrar importação, contornos, motor temporal e dimensões.
## Entradas e saídas
String SVG e opções; `CuttingTimeResult`.
## Fluxo principal
`processSvg` → conversão de elementos →
[Facade compartilhada](../../calculation/calculateDrawingTime.ts) → cálculo e dimensões escaladas.
## Erros e casos-limite
Propaga erros; SVG sem geometria retorna tempos zerados, sem dimensões artificiais.
## Exemplos
`calculateCuttingTimeFromSvg('<svg><line x2="10"/></svg>', { materialThickness: 3 })`.
## Dependências e integrações
[Processador SVG](./processSvg.doc.md), conversor e motor.
