# CuttingTimeOptions

## Visão geral
Contrato de parâmetros de processo de um trabalho.
## Responsabilidades
Expressar receita e overrides sem inferir material somente pela espessura.
## Entradas e saídas
Espessura obrigatória; leads/kerf em mm, feeds em mm/min, durações em segundos e
aceleração em mm/s². `optimize` controla somente ordenação geométrica.
`machineProfile` seleciona `glory-star-gs3015` (padrão), `talvi-6000w-raytools`
ou `hypertherm-hpr400xd` (aço carbono O₂/ar).
## Fluxo principal
O [resolver](../calculation/resolveCuttingParameters.ts) valida opções e aplica referências.
## Erros e casos-limite
`scaleFactor` escala geometria, não calibra tempo. `pierceTime` representa o ciclo
completo por contorno. `setupTimeSec: 0` exclui setup; kerf não multiplica perímetro.
Talvi exige velocidade de corte, tempo de perfuração, rápido, setup e aceleração
explícitos; a potência e o fabricante do cabeçote não permitem inferir esses valores.
HPR400XD fornece velocidade/atraso normal de perfuração da receita exata,
exigindo rápido, setup e aceleração da mesa. O atraso tabelado não inclui o ciclo
completo de IHS/gases/retração; para estimá-lo, informe `pierceTime` medido.
## Exemplos
`const options: CuttingTimeOptions = { materialThickness: 3, cuttingSpeed: 3400, pierceTime: 0.03 };`
## Dependências e integrações
Contrato compartilhado pelo motor, formatos e seleção explícita de receita.
Perfis disponíveis em [machineProfiles](../technology/profiles/machineProfiles.doc.md).
