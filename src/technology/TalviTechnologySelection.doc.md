# TalviTechnologySelection

## Visão geral
Overrides para corrigir unidades inferidas e fornecer perfuração medida.
## Responsabilidades
Permitir calibração sem alterar o catálogo bruto.
## Entradas e saídas
`speedUnit`: `mm/s` ou `mm/min`; omissão infere `mm/s`.
`timeUnit`: `ms` ou `s`; omissão infere `ms`.
`pierceTimeSec`: ciclo completo não negativo em segundos, independentemente de `timeUnit`.
## Fluxo principal
A seleção acompanha o nome exato passado a `getTalviTechnologyOptions`.
## Erros e casos-limite
Unidades inválidas, tempos negativos ou não finitos geram erro.
Sem etapas ativas, `pierceTimeSec` é obrigatório.
## Exemplos
`{ speedUnit: 'mm/s', timeUnit: 'ms', pierceTimeSec: 1.5 }`.
## Dependências e integrações
[Conversão](./getTalviTechnologyOptions.ts).
