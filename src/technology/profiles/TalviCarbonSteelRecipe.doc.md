# TalviCarbonSteelRecipe

## Visão geral
Contrato dos valores brutos de uma receita de aço carbono confirmada como Talvi.
## Responsabilidades
Manter arquivo, gás e parâmetros juntos sem selecionar uma receita somente por espessura.
## Entradas e saídas
Nome original, espessura extraída do nome em mm, `dSpeed`, `nPower`, `strGasType`,
`dGasPressure`, `dHeight`, `dFocus`, `nPreCutDelay`, `nCoolDelay` e etapas ativas.
Valores brutos de velocidade, pressão e tempo não possuem unidade escrita na fonte.
## Fluxo principal
[Catálogo](./talviCarbonSteelRecipes.ts) → seleção por nome exato →
[conversão de unidades](../getTalviTechnologyOptions.ts).
## Erros e casos-limite
Não trata diâmetro de bico como kerf nem espessura 6,3 como 6,35 mm.
Não contém calibração de rápido, aceleração ou setup da mesa.
## Exemplos
As receitas de 4,75 mm N₂ e O₂ são registros distintos.
## Dependências e integrações
[TalviPierceStage](./TalviPierceStage.ts) e arquivos HSTool fornecidos pelo operador.
