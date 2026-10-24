# CuttingTimeOptions

## Visão geral
Contrato de parâmetros de processo de um trabalho.
## Responsabilidades
Expressar receita e overrides sem inferir material somente pela espessura.
## Entradas e saídas
Espessura obrigatória; leads/kerf em mm, feeds em mm/min, durações em segundos e
aceleração em mm/s². `optimize` controla somente ordenação geométrica.
## Fluxo principal
O [resolver](../calculation/resolveCuttingParameters.ts) valida opções e aplica referências.
## Erros e casos-limite
`scaleFactor` escala geometria, não calibra tempo. `pierceTime` representa o ciclo
completo por contorno. `setupTimeSec: 0` exclui setup; kerf não multiplica perímetro.
## Exemplos
`const options: CuttingTimeOptions = { materialThickness: 3, cuttingSpeed: 3400, pierceTime: 0.03 };`
## Dependências e integrações
Contrato compartilhado pelo motor, formatos e seleção explícita de receita.
