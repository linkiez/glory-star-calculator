# Inspeção DXF

## Visão geral
CLI tipado para inventário e comparação de estimativas DXF.
## Responsabilidades
Contar entidades e apresentar o cálculo canônico com e sem otimização,
sem manter algoritmos geométricos ou de tempo paralelos.
## Entradas e saídas
Caminho DXF opcional e espessura em mm (padrão 3); JSON no console.
Sem caminho, utiliza `fixtures/drawings/LPEL-1530.dxf`.
## Fluxo principal
Leitura → inventário de entidades → duas chamadas à API pública → JSON.
## Erros e casos-limite
Falhas de leitura, parser ou opções encerram a execução com erro.
Contagens do DXF bruto incluem anotações e não equivalem à quantidade de contornos.
O diagnóstico não confirma tempo físico nem receita da máquina.
## Exemplos
`npm run inspect:dxf -- fixtures/drawings/LPEL-1530.dxf 3`.
## Dependências e integrações
`dxf-parser` e calculadora; contratos de ângulo no [estudo](../docs/cutting-time-study.md).
