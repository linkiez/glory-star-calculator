# Perfis de máquinas

## Visão geral
Catálogo público `MACHINE_PROFILES` com configurações isoladas.
## Responsabilidades
Agrupar referências de processo, movimento e limites por máquina.
## Entradas e saídas
- `glory-star-gs3015`: tabelas, rápido, setup, overhead e limites existentes.
- `talvi-6000w-raytools`: potência de 6000 W e cabeçote Raytools;
  modelo específico do cabeçote não confirmado. Receitas HSTool de aço carbono
  fornecidas pelo operador são selecionadas por nome via `getTalviTechnologyOptions`.
- `hypertherm-hpr400xd`: aço carbono convencional O₂/ar; receitas discretas
  com corrente selecionada para acabamento, feed, atraso normal de perfuração e kerf.
## Fluxo principal
O cálculo omisso seleciona Glory Star. Talvi exige `cuttingSpeed`, `pierceTime`,
`rapidSpeed`, `setupTimeSec` e `accelerationMmPerSec2` explícitos.
As receitas Talvi não são aplicadas automaticamente por espessura: N₂/O₂ e bicos
alternativos não devem ser misturados. A seleção HSTool infere mm/s e ms com
avisos; exige duração informada quando não há etapas habilitadas. Rápido, setup e
aceleração da mesa continuam explícitos.
HPR400XD fornece feed/perfuração da espessura exata; rápido/setup/aceleração
permanecem explícitos, pois dependem da mesa. Consulte corrente e origem com
`getHprCarbonSteelRecipe(thicknessMm)`.
## Erros e casos-limite
O compartilhamento da máquina não é consultado durante o cálculo.
Não há credenciais, leitura automática de fontes locais ou parâmetros inferidos pela potência.
Zero para setup/perfuração deve ser uma decisão explícita do consumidor.
As constantes públicas de `technology/reference` representam somente a Glory Star.
HPR400XD não interpola entre espessuras nem usa True Hole, chanfro ou submerso.
Qualidade e ciclo completo dependem de calibração; as receitas são referências
extraídas da planilha fornecida, não instruções para operar a máquina.
## Exemplos
```ts
const profile = MACHINE_PROFILES['talvi-6000w-raytools'];
// Supply values measured/exported from this machine, not Glory Star defaults.
const result = calculateCuttingTime(movements, {
  machineProfile: profile.id,
  materialThickness: recipe.thicknessMm,
  cuttingSpeed: recipe.feedMmPerMin,
  pierceTime: recipe.pierceTimeSec,
  rapidSpeed: machine.rapidMmPerMin,
  setupTimeSec: machine.setupTimeSec,
  accelerationMmPerSec2: machine.accelerationMmPerSec2
});
```
## Dependências e integrações
Referências existentes são a fonte dos valores Glory Star; catálogo, tabelas e
overhead publicados são congelados. Receitas CSV podem fornecer espessura,
feed e perfuração com seleção e unidade explícitas via `getLaserTechnologyOptions`.
[Origem e critérios HPR400XD](./hprCarbonSteelRecipes.doc.md).
[Origem e hipóteses Talvi](./talviCarbonSteelRecipes.doc.md).
