# API pública

## Visão geral
Ponto de entrada do pacote.
## Responsabilidades
Reexportar tipos, constantes, cálculo, SVG e seleção de receita.
Disponibilizar `MachineProfile`, `MachineProfileId`, `MACHINE_PROFILES` e `getMachineProfile`.
Disponibilizar `HprCarbonSteelRecipe`, `HPR_CARBON_STEEL_RECIPES`
e `getHprCarbonSteelRecipe` para consultar corrente e receita exata de aço carbono.
Disponibilizar `TALVI_CARBON_STEEL_RECIPES`, `getTalviTechnologyOptions` e seus
tipos para selecionar arquivos HSTool confirmados da Talvi.
## Entradas e saídas
Funções disponíveis via `@linkiez/glory-star-calculator`.
## Fluxo principal
Consumidor → reexports → implementação correspondente.
## Erros e casos-limite
Não captura erros dos módulos; não lê automaticamente o CSV privado.
Constantes de referência públicas pertencem à Glory Star. Para selecionar Talvi,
use `machineProfile: 'talvi-6000w-raytools'` e parâmetros explícitos do equipamento.
`getTalviTechnologyOptions` converte receitas de aço carbono com unidades e
perfuração inferidas sinalizadas em `assumptions`; sem etapas ativas exige ciclo informado.
O consumidor deve apresentar os avisos e fornecer rápido/setup/aceleração da mesa.
Para HPR400XD, use `machineProfile: 'hypertherm-hpr400xd'`, espessura tabelada
e rápido/setup/aceleração explícitos. Receitas de aço carbono O₂/ar não são
uma garantia de acabamento nem incluem todos os tempos auxiliares da mesa.
## Exemplos
`import { getLaserTechnologyOptions, calculateCuttingTimeFromDxf } from '@linkiez/glory-star-calculator'`.
## Dependências e integrações
O build TypeScript gera `dist/index.js` e declarações para publicação.
Detalhes dos perfis em [machineProfiles](./technology/profiles/machineProfiles.doc.md).
