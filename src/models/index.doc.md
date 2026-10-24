# Contratos de cálculo

## Visão geral
Tipos públicos da biblioteca.
## Responsabilidades
Descrever geometria, opções e decomposição do resultado.
## Entradas e saídas
`Point`, `Movement`, `ProcessedSVGElement`, `CuttingTimeOptions`, `CuttingTimeResult`.
## Fluxo principal
Importadores produzem movimentos; motor consome opções e entrega resultados.
## Erros e casos-limite
Validação numérica ocorre no motor. `startsContour` identifica reinício de laser.
`partCount` é contagem de contornos por compatibilidade, não peças físicas.
## Exemplos
`{ materialThickness: 3, cuttingSpeed: 3400, pierceTime: 0.03, setupTimeSec: 0 }`.
## Dependências e integrações
Todos os adaptadores; unidades e opções no [README](../../README.md).
