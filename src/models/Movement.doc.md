# Movement

## Visão geral
Segmento de ferramenta independente de SVG, DXF ou filesystem.
## Responsabilidades
Distinguir corte, posicionamento e início explícito de contorno.
## Entradas e saídas
Pontos inicial/final, `isCutting` e `startsContour` opcional.
## Fluxo principal
Adaptadores produzem movimentos; o motor acumula segmentos contínuos por contorno.
## Erros e casos-limite
Lacunas implicam viagem mesmo sem otimização; uma fronteira explícita separa
contornos que compartilham a mesma coordenada.
## Exemplos
`const move: Movement = { start: { x: 0, y: 0 }, end: { x: 10, y: 0 }, isCutting: true };`
## Dependências e integrações
[Point](./Point.ts), processamento de formatos e motor de cálculo.
