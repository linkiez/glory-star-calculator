# calculateDrawingTime

## Visão geral
Facade interna compartilhada pelos adaptadores de desenho.
## Responsabilidades
Compor a estimativa temporal e os limites geométricos com a mesma escala.
## Entradas e saídas
Movimentos em mm e opções → resultado com dimensões opcionais de corte.
## Fluxo principal
[calculateCuttingTime](./calculateCuttingTime.ts) valida e calcula;
[withCutBounds](../geometry/withCutBounds.ts) acrescenta a área.
## Erros e casos-limite
Propaga validações do motor; desenho sem corte não recebe dimensões.
## Exemplos
`calculateDrawingTime(movements, { materialThickness: 3, scaleFactor: 2 });`
## Dependências e integrações
Usada por SVG e DXF; não importa parsers, filesystem ou formatos.
