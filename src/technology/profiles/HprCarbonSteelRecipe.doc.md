# HprCarbonSteelRecipe

## Visão geral
Receita de referência convencional para aço carbono, plasma O₂ e proteção por ar.
## Responsabilidades
Manter espessura, corrente, velocidade, perfuração e kerf da mesma linha de processo.
## Entradas e saídas
Espessura/kerf em mm, corrente em A, velocidade em mm/min e perfuração em segundos.
`sourceRow` identifica a linha da aba `Cut` da planilha Phoenix.
## Fluxo principal
[Seleção](./getHprCarbonSteelRecipe.ts) consulta a espessura exata e retorna o registro congelado.
## Erros e casos-limite
`pierceTimeSec` é o atraso normal `Pierce Time` (AG), não `Edge Pierce Time` (AH).
Não representa o ciclo completo de IHS, aproximação, gases e retração da mesa.
## Exemplos
`getHprCarbonSteelRecipe(12)` indica 80 A, 1410 mm/min e atraso de 0,7 s.
## Dependências e integrações
[Dados e proveniência](./hprCarbonSteelRecipes.doc.md); opções do motor permitem
substituir a duração por um ciclo completo medido.
