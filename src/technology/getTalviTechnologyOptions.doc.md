# getTalviTechnologyOptions

## Visão geral
Seleciona uma receita Talvi de aço carbono e converte valores para o motor.
## Responsabilidades
Preservar alternativas de gás/bico e explicitar hipóteses autorizadas pelo usuário.
## Entradas e saídas
Nome exato do arquivo e overrides opcionais → `TalviTechnologyOptions`.
`dSpeed` omisso em unidade é inferido em mm/s; feed = `dSpeed × 60`.
Os tempos são inferidos em ms; os valores do XML não têm unidade declarada.
## Fluxo principal
1. Localizar nome exato no catálogo.
2. Validar unidades e converter velocidade.
3. Usar `pierceTimeSec` se informado; caso contrário, exigir etapas ativas.
4. Aproximar duração sequencial de cada etapa ativa por
   `nTime + nResidenceTime + nCloseLaserOpenGasTime`.
5. Acrescentar `nPreCutDelay + nCoolDelay` uma vez por contorno e converter para segundos.
6. Retornar opções com `assumptions` e `timingBasis`.

## Erros e casos-limite
A soma é um modelo provisório, não uma especificação do controlador:
campos podem se sobrepor ou representar comportamentos diferentes.
Movimento vertical, detecção da chapa, outras esperas e transições não são modelados.
O consumidor deve exibir os avisos e preferir o ciclo completo medido.
Não somar etapas desabilitadas, perfuração não indutiva desabilitada ou tempos
de modelos inativos. Sem etapas habilitadas e sem override, gerar erro em vez de zero.

Nomes desconhecidos, unidades inválidas, override negativo ou não finito geram erro.
Não arredonda espessuras, não interpola receitas nem escolhe gás automaticamente.
Overrides sempre são segundos, mesmo se `timeUnit: 'ms'`.
Não fornece rápido, setup, aceleração ou kerf da Glory Star.

## Exemplos
```ts
const technology = getTalviTechnologyOptions('8mm aco carbono d1.5.HSTool');
technology.assumptions.forEach(message => console.warn(message));
const result = calculateCuttingTime(movements, {
  ...technology,
  rapidSpeed: machine.rapidMmPerMin,
  setupTimeSec: machine.setupTimeSec,
  accelerationMmPerSec2: machine.accelerationMmPerSec2
});
```
Para 0,9 mm, sem etapas ativas:
```ts
const technology = getTalviTechnologyOptions('0.9mm aco carbono s1.5.HSTool', {
  speedUnit: 'mm/s',
  timeUnit: 'ms',
  pierceTimeSec: measured.fullPierceCycleSec
});
```

## Dependências e integrações
[Catálogo e origem](./profiles/talviCarbonSteelRecipes.doc.md),
[seleção](./TalviTechnologySelection.ts) e [saída](./TalviTechnologyOptions.ts).
O perfil Talvi permanece sem defaults por espessura, pois há alternativas N₂/O₂;
use esta seleção para obter os parâmetros da receita e completar os dados da mesa.
