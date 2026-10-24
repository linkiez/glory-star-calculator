# RAPID_SPEED

## Visão geral
Feed de referência de posicionamento em mm/min.
## Responsabilidades
Definir o valor padrão quando `rapidSpeed` não é fornecido.
## Entradas e saídas
Constante numérica positiva.
## Fluxo principal
O resolver seleciona override ou referência; o motor calcula viagens.
## Erros e casos-limite
Não confirma o rápido efetivo da máquina nem tempos de eixo Z.
## Exemplos
`const options = { materialThickness: 3, rapidSpeed: RAPID_SPEED };`
## Dependências e integrações
[Resolver](../../calculation/resolveCuttingParameters.ts); API pública.
