# API de cálculo

## Visão geral
Barrel de compatibilidade dos cálculos públicos.
## Responsabilidades
Expor as funções sem duplicar geometria ou regras temporais.
## Entradas e saídas
Reexporta funções de distância, referências e estimativas.
## Fluxo principal
Importação → API principal → implementação correspondente.
## Erros e casos-limite
Propaga validações; não transforma unidades nem captura erros.
## Exemplos
`import { calculateCuttingTimeFromDxf } from './cuttingCalculator';`
## Dependências e integrações
[API principal](./index.ts) e [estudo técnico](../docs/cutting-time-study.md).
