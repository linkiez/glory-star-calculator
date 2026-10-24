# getCuttingSpeed

## Visão geral
Consulta da velocidade de referência, não uma seleção de material.
## Responsabilidades
Interpolar `CUTTING_SPEEDS`.
## Entradas e saídas
Espessura em mm; velocidade em mm/min.
## Fluxo principal
Delegação a [interpolateParameter](./interpolateParameter.doc.md).
## Erros e casos-limite
Espessura deve ser positiva e finita; extremos saturam nesta API de consulta.
## Exemplos
`getCuttingSpeed(3)` retorna 3400.
## Dependências e integrações
Constantes de referência; use receita explícita para representar a máquina.
