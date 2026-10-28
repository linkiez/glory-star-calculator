# TalviTechnologyOptions

## Visão geral
Opções compatíveis com o motor, acompanhadas de origem e limitações.
## Responsabilidades
Tornar visíveis unidades inferidas e aproximação de perfuração.
## Entradas e saídas
Estende `CuttingTimeOptions` com `recipe`, `speedUnit`, `timeUnit`,
`timingBasis` e `assumptions`. Feed em mm/min e `pierceTime` em segundos.
## Fluxo principal
Selecionar receita → revisar `assumptions` → informar parâmetros da mesa → calcular.
## Erros e casos-limite
`estimated-stage-sum` não é ciclo completo validado; `explicit-cycle` identifica
override do chamador, não certificação de medição pela biblioteca.
Os avisos devem ser exibidos pelo consumidor quando houver inferências.
## Exemplos
`options.assumptions.forEach(message => console.warn(message));`
## Dependências e integrações
[Receita](./profiles/TalviCarbonSteelRecipe.ts), `CuttingTimeOptions` e APIs SVG/DXF/Node.
