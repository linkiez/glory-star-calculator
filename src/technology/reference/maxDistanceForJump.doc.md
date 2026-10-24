# MAX_DISTANCE_FOR_JUMP

## Visão geral
Referência histórica pública de distância em mm para salto.
## Responsabilidades
Manter o parâmetro acessível sem inventar ciclos de Z.
## Entradas e saídas
Constante numérica.
## Fluxo principal
Disponível aos consumidores; o motor usa distância e feed para posicionamento.
## Erros e casos-limite
O limite não produz simulação de salto nem de colisões.
## Exemplos
`const referenceDistance = MAX_DISTANCE_FOR_JUMP;`
## Dependências e integrações
Sem dependências; API pública.
