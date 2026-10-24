# SVGElementType

## Visão geral
Enum de tipos geométricos SVG processáveis.
## Responsabilidades
Identificar elementos sem depender de strings dispersas no processamento.
## Entradas e saídas
Membros usados nos elementos processados e disponíveis pela API principal.
## Fluxo principal
O processador reconhece o elemento e associa o membro correspondente.
## Erros e casos-limite
O enum não garante suporte a qualquer recurso SVG; atributos não suportados
são tratados pelo processador.
## Exemplos
`const type = SVGElementType.Line;`
## Dependências e integrações
[ProcessedSVGElement](./ProcessedSVGElement.ts); sem dependências runtime.
