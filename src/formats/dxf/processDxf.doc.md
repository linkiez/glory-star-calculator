# processDxf

## Visão geral
Importador de contornos DXF planares.
## Responsabilidades
Interpretar unidades, arcos, bulges, fechamento e transformações de blocos.
## Entradas e saídas
Texto DXF; movimentos em mm com `startsContour`.
## Fluxo principal
Parser → espaço modelo → expansão de INSERT → pontos → conexão pelos extremos.
LINE, ARC, CIRCLE, LWPOLYLINE e POLYLINE planares são suportados. Contornos fechados
não são unidos a outros contornos, mesmo se tocarem.
## Erros e casos-limite
Blocos ausentes/cíclicos, unidades não suportadas, entidades de corte não
suportadas, extrusões e geometrias inválidas geram erro. Papel, texto, dimensões,
pontos e preenchimentos SOLID não são trajetórias de corte.
Sem unidade declarada assume mm. INSERT respeita base, posição, escala e rotação.
## Exemplos
Arco de raio 10 mm e 90° produz aproximadamente 15,707963 mm.
## Dependências e integrações
`dxf-parser` fornece ângulos em radianos e fechamento em `shape`.
A conexão usa a [tolerância compartilhada](../../geometry/geometryTolerance.ts);
[estudo](../../../docs/cutting-time-study.md) documenta tolerância e limites.
