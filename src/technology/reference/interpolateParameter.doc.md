# interpolateParameter

## Visão geral
Resolução interpolada ou exata das tabelas de referência.
## Responsabilidades
Compartilhar a regra entre velocidade e perfuração.
## Entradas e saídas
Tabela numérica e espessura positiva; parâmetro interpolado na unidade da tabela.
Terceiro argumento `exactThicknessOnly` opcional, padrão `false`.
## Fluxo principal
Ordenar espessuras → localizar intervalo → interpolar.
Com `exactThicknessOnly: true`, exigir chave própria exata e devolver seu valor.
## Erros e casos-limite
Espessura inválida gera erro; consultas fora da tabela saturam nos extremos por
compatibilidade. O motor exige receita nesses casos.
Perfis discretos, como HPR400XD, rejeitam toda espessura não listada, inclusive
fora dos extremos; não misturam receitas de correntes diferentes.
## Exemplos
Entre valores 10 em 1 mm e 20 em 2 mm, retorna 15 em 1,5 mm.
## Dependências e integrações
Chamado por `getCuttingSpeed`, `getPierceTime` e pelo resolver do motor.
