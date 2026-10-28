# Receitas Talvi — aço carbono HSTool

## Visão geral
17 receitas de 0,9 a 23 mm extraídas dos arquivos em
[Parametros TAVI](../../../docs/parametros/Parametros%20TAVI/).
O usuário confirmou a origem Talvi 6000 W / Raytools em 28/10/2026 e autorizou
inferir unidades para estimativa. Essa confirmação não certifica a interpretação
dos campos nem o desempenho físico.

## Responsabilidades
Preservar números originais, alternativas de gás/bico e somente etapas ativas.
As receitas não são uma tabela interpolável por espessura.

## Entradas e saídas
`TALVI_CARBON_STEEL_RECIPES` é um array congelado de registros, arrays e etapas
também congelados. Há 23 etapas habilitadas no conjunto.
Os dados de inox, alumínio e arquivos sem identificação de aço carbono não integram este catálogo.

## Fluxo principal
Filtrar nomes `aco carbono` → extrair `HCutParamtersSt` →
selecionar `HPiercing/bOpen=true` → publicar dados brutos →
converter com `getTalviTechnologyOptions`.

| Espessura | Alternativa | `dSpeed` bruto | Feed inferido em mm/min |
|---|---|---:|---:|
| 0,9 e 1,2 mm | N₂ | 300 | 18000 |
| 1,5 e 2 mm | N₂ | 200 | 12000 |
| 3 mm | N₂ | 150 | 9000 |
| 4,75 mm | O₂ / N₂ | 45 / 83,3333 | 2700 / 5000 |
| 6,3 mm | O₂ / N₂ | 33,3333 / 85 | 2000 / 5100 |
| 8 e 9,5 mm | O₂ | 25 | 1500 |
| 12,5 mm | O₂ | 16,6667 | 1000 |
| 14 mm | O₂ | 13,3333 | 800 |
| 16 mm | O₂ | 15 | 900 |
| 19 mm | O₂ | 13,3333 | 800 |
| 23 mm | O₂ | 8 | 480 |

`dSpeed` é inferido em mm/s, pois multiplicá-lo por 60 produz feeds coerentes
com uma fonte de 6 kW, inclusive valores fracionários típicos da conversão.
Isso é indício, não prova; a API permite corrigir para mm/min.
Altura/foco são tratados como valores em mm por hipótese do usuário.
Pressão permanece bruta: não se atribui bar sem confirmação.

## Erros e casos-limite
0,9/1,2/1,5/2 mm não têm etapas habilitadas: isso não significa perfuração zero.
É obrigatório fornecer o tempo completo em segundos para essas receitas.
O nome `6.3mm aco carbono d 2 HSTool` é mantido, mesmo sem ponto antes de HSTool;
seus dados são idênticos aos de `6.3mm aco carbono s3.0.HSTool`.
Os campos de perfuração não indutiva estão desabilitados nas 17 fontes;
`dTimeForNoninductivePiercing=100` não é somado.

Não há kerf ou parâmetros globais da mesa confirmados. Os arquivos NC de 2/8 mm
são idênticos e não servem para inferir mudanças de feed.
As receitas não são instruções de operação da máquina nem garantia de acabamento.

## Exemplos
`getTalviTechnologyOptions('8mm aco carbono d1.5.HSTool')` retorna 1500 mm/min,
tempo **estimado** de 0,56 s e avisos explícitos de inferência.
Com `pierceTimeSec` medido, a aproximação de etapas é substituída integralmente.

## Dependências e integrações
[Contrato](./TalviCarbonSteelRecipe.ts), [etapas](./TalviPierceStage.ts),
[opções](../getTalviTechnologyOptions.doc.md) e perfil `talvi-6000w-raytools`.
Não há leitura de arquivos, execução de NC nem comunicação com a máquina em runtime.
