# MAX_DISTANCE_FOR_HEAD_DOWN

## Visão geral
Referência histórica pública de distância em mm para cabeça baixa.
## Responsabilidades
Preservar um parâmetro consultável sem simular comportamento de Z não confirmado.
## Entradas e saídas
Constante numérica.
## Fluxo principal
Disponível aos consumidores; não altera o cálculo temporal do motor.
## Erros e casos-limite
Não determina uma estratégia do controlador nem garante autorização de movimento.
## Exemplos
`const referenceDistance = MAX_DISTANCE_FOR_HEAD_DOWN;`
## Dependências e integrações
Sem dependências; API pública.
