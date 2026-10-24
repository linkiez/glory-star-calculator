# CUTTING_SPEEDS

## Visão geral
Tabela de referência de feed por espessura, não uma receita de material.
## Responsabilidades
Fornecer a fonte única de valores de corte históricos.
## Entradas e saídas
Chaves em mm de espessura; valores em mm/min.
## Fluxo principal
[getCuttingSpeed](./getCuttingSpeed.ts) consulta/interpola a tabela.
## Erros e casos-limite
Não identifica gás ou potência; fora da faixa, o motor exige override de receita.
## Exemplos
`const referenceFeed = CUTTING_SPEEDS[3];`
## Dependências e integrações
Sem dependências; exposta pela API principal.
