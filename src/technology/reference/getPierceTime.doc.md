# getPierceTime

## Visão geral
Consulta do tempo de perfuração de referência.
## Responsabilidades
Interpolar `PIERCE_TIMES`.
## Entradas e saídas
Espessura em mm; duração em segundos.
## Fluxo principal
Delegação a [interpolateParameter](./interpolateParameter.doc.md).
## Erros e casos-limite
Espessura deve ser positiva e finita; extremos saturam nesta API de consulta.
## Exemplos
`getPierceTime(3)` retorna 0,3.
## Dependências e integrações
Constantes, não interpretação automática das unidades do CSV.
