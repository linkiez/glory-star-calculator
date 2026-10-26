# getPierceTime

## Visão geral
Consulta do tempo de perfuração de referência.
## Responsabilidades
Interpolar a tabela de perfuração do perfil selecionado.
## Entradas e saídas
Espessura em mm e identificador de máquina opcional; duração em segundos.
## Fluxo principal
Resolve perfil (Glory Star por padrão) e delega a [interpolateParameter](./interpolateParameter.doc.md).
## Erros e casos-limite
Espessura deve ser positiva e finita; extremos saturam nesta API de consulta.
Exceção: perfis `exactThicknessOnly`, como HPR400XD, exigem espessura listada
e não interpolam nem saturam extremos. HPR400XD retorna atraso normal da tabela,
não ciclo completo de IHS/gases/retração.
Perfil desconhecido ou sem tabela (Talvi) gera erro, sem referência de outra máquina.
## Exemplos
`getPierceTime(3)` retorna 0,3.
## Dependências e integrações
[Perfis](../profiles/machineProfiles.doc.md), não interpretação automática das unidades do CSV.
