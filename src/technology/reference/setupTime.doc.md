# SETUP_TIME

## Visão geral
Duração de setup de referência em segundos.
## Responsabilidades
Definir o padrão único de setup por trabalho.
## Entradas e saídas
Constante numérica não negativa.
## Fluxo principal
O resolver aplica o padrão; o motor acrescenta setup uma vez quando existe corte.
## Erros e casos-limite
Trabalho sem corte não recebe setup. `setupTimeSec: 0` exclui essa parcela.
## Exemplos
`const referenceSetupSeconds = SETUP_TIME;`
## Dependências e integrações
[Resolver](../../calculation/resolveCuttingParameters.ts); API pública.
