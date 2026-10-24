# interpolateParameter

## Visão geral
Interpolação linear das tabelas de referência.
## Responsabilidades
Compartilhar a regra entre velocidade e perfuração.
## Entradas e saídas
Tabela numérica e espessura positiva; parâmetro interpolado na unidade da tabela.
## Fluxo principal
Ordenar espessuras → localizar intervalo → interpolar.
## Erros e casos-limite
Espessura inválida gera erro; consultas fora da tabela saturam nos extremos por
compatibilidade. O motor exige receita nesses casos.
## Exemplos
Entre valores 10 em 1 mm e 20 em 2 mm, retorna 15 em 1,5 mm.
## Dependências e integrações
Chamado por `getCuttingSpeed` e `getPierceTime`.
