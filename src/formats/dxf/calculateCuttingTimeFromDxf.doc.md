# calculateCuttingTimeFromDxf

## Visão geral
Adaptador público DXF → estimativa.
## Responsabilidades
Integrar importação, motor temporal e dimensões.
## Entradas e saídas
String DXF e opções; `CuttingTimeResult`.
## Fluxo principal
`processDxf` → [Facade compartilhada](../../calculation/calculateDrawingTime.ts)
→ motor temporal e dimensões escaladas.
## Erros e casos-limite
Propaga erros de geometria/unidades/parâmetros sem retornar um orçamento parcial.
## Exemplos
`calculateCuttingTimeFromDxf(content, { materialThickness: 3, optimize: true })`.
## Dependências e integrações
[Processador DXF](./processDxf.doc.md) e [motor](../../calculation/calculateCuttingTime.doc.md).
