# TechnologySelection

## Visão geral
Contrato de seleção explícita de receita no CSV.
## Responsabilidades
Exigir CODE, perfil de corte, perfil de perfuração e unidade de tempo.
## Entradas e saídas
`code`, `cutProfile`, `pierceProfile`, `pierceTimeUnit: 's' | 'ms' | 'cs'`.
## Fluxo principal
[getLaserTechnologyOptions](./getLaserTechnologyOptions.ts) valida a seleção e
converte a receita para opções do motor.
## Erros e casos-limite
A unidade não é inferida; perfis de perfuração não são somados automaticamente.
Material, gás e estágios ativos precisam de confirmação no CAM/máquina.
## Exemplos
`const selection: TechnologySelection = { code: '3030', cutProfile: 'A', pierceProfile: 'A', pierceTimeUnit: 'ms' };`
## Dependências e integrações
Sem dependências; exportado como tipo pela API principal.
