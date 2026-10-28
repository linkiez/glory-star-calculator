# TalviPierceStage

## Visão geral
Tempos brutos de uma etapa HSTool habilitada (`bOpen=true`).
## Responsabilidades
Preservar campos sem incluir valores de modelos de perfuração desabilitados.
## Entradas e saídas
`time` corresponde a `nTime`, `residenceTime` a `nResidenceTime` e
`closeLaserOpenGasTime` a `nCloseLaserOpenGasTime`.
Unidades não são declaradas no XML.
## Fluxo principal
A extração seleciona somente etapas ativas e preserva os três números.
## Erros e casos-limite
A interpretação em ms e a soma sequencial são hipóteses autorizadas pelo usuário,
não uma especificação confirmada do controlador.
## Exemplos
8 mm: `time: 10`, `residenceTime: 350`, `closeLaserOpenGasTime: 200`.
## Dependências e integrações
[Receitas](./talviCarbonSteelRecipes.ts) e
[conversão](../getTalviTechnologyOptions.doc.md).
