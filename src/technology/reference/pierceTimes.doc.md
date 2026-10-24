# PIERCE_TIMES

## Visão geral
Tabela histórica de perfuração por espessura.
## Responsabilidades
Manter uma fonte única para duração de referência por contorno.
## Entradas e saídas
Chaves em mm; valores em segundos.
## Fluxo principal
[getPierceTime](./getPierceTime.ts) consulta/interpola a tabela.
## Erros e casos-limite
Não representa automaticamente os estágios ativos do CAM; `pierceTime` explícito
deve incluir o ciclo completo confirmado.
## Exemplos
`const referenceSeconds = PIERCE_TIMES[3];`
## Dependências e integrações
Sem dependências; usada pelo resolver e exposta pela API principal.
