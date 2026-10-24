# resolveCuttingParameters

## Visão geral
Fronteira única de validação e resolução das opções de processo.
## Responsabilidades
Aplicar overrides, consultar referências e normalizar unidades do motor.
## Entradas e saídas
`CuttingTimeOptions` → escala, feed, perfuração, rápido, setup, leads e aceleração.
## Fluxo principal
Valida espessura e alcance das tabelas, resolve valores opcionais, valida números
finitos e restrições de perfuração.
## Erros e casos-limite
Rejeita negativos, zeros onde exigida positividade, tipos de perfuração inválidos,
`flying` sem duração e ausência de receita fora das referências.
## Exemplos
`resolveCuttingParameters({ materialThickness: 3, setupTimeSec: 0 });`
## Dependências e integrações
[Referências tecnológicas](../technology/reference/) e funções de interpolação;
usada pelo motor, não por parsers.
