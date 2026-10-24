# optimizeMovements

## Visão geral
Heurística de vizinho mais próximo aplicada a contornos completos.
## Responsabilidades
Ordenar e inverter contornos sem alterar segmentos nem misturar fronteiras explícitas.
## Entradas e saídas
Movimentos validados e escalados → sequência de cortes e posicionamentos.
## Fluxo principal
Agrupa contornos, seleciona a extremidade mais próxima, insere viagem e preserva
o destino do posicionamento final explícito. Não modifica os movimentos recebidos.
## Erros e casos-limite
Sem contornos, mantém a sequência. Complexidade quadrática no número de contornos;
não garante ordem interno/externo nem equivalência ao CAM.
## Exemplos
`const ordered = optimizeMovements(movements);`
## Dependências e integrações
[calculateDistance](../geometry/calculateDistance.ts) e
[tolerância compartilhada](../geometry/geometryTolerance.ts).
