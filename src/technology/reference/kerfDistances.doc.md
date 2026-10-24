# KERF_DISTANCE

## Visão geral
Tabela pública histórica de referência de kerf em mm.
## Responsabilidades
Preservar consulta pelos consumidores, sem compensar artificialmente o tempo.
## Entradas e saídas
Chaves de espessura em mm; larguras de referência em mm.
## Fluxo principal
Aplicativos podem consultar a tabela; o motor mede a linha central fornecida.
## Erros e casos-limite
Não multiplica distância ou tempo. A compensação geométrica pertence ao CAM.
## Exemplos
`const referenceKerf = KERF_DISTANCE[3];`
## Dependências e integrações
Sem dependências; reexportada pela API principal.
