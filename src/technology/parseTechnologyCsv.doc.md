# parseTechnologyCsv

## Visão geral
Parser textual isolado para exportações CSV de tecnologia.
## Responsabilidades
Interpretar células sem aplicar regras de seleção de receita.
## Entradas e saídas
String CSV → matriz de strings, mantendo conteúdo das células.
## Fluxo principal
Remove BOM inicial, percorre caracteres e reconhece delimitadores, aspas,
escapes, CRLF e quebras de linha dentro de células entre aspas.
## Erros e casos-limite
Rejeita aspas inválidas ou não fechadas; ignora linhas vazias.
Não faz coerção numérica nem valida cabeçalhos.
## Exemplos
`parseTechnologyCsv('CODE,TH\n3030,3');`
## Dependências e integrações
Sem dependências; usado por [getLaserTechnologyOptions](./getLaserTechnologyOptions.ts).
