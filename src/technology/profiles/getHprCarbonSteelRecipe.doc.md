# getHprCarbonSteelRecipe

## Visão geral
Consulta auditável da receita de aço carbono convencional O₂/ar.
## Responsabilidades
Expor corrente e parâmetros da espessura selecionada automaticamente pelo perfil.
## Entradas e saídas
`thicknessMm: number` → `HprCarbonSteelRecipe` congelada.
## Fluxo principal
Validar espessura positiva e finita → localizar correspondência exata → devolver receita.
Não interpola nem escolhe uma espessura próxima.
## Erros e casos-limite
Espessuras inválidas ou não listadas geram erro explícito.
O critério é menor corrente tabelada; não garante acabamento nem calcula outras
geometrias/processos. Ver [fontes e limites](./hprCarbonSteelRecipes.doc.md).
## Exemplos
```ts
const recipe = getHprCarbonSteelRecipe(12);
const result = calculateCuttingTime(movements, {
  machineProfile: 'hypertherm-hpr400xd',
  materialThickness: recipe.thicknessMm,
  rapidSpeed: table.rapidMmPerMin,
  setupTimeSec: table.setupTimeSec,
  accelerationMmPerSec2: table.accelerationMmPerSec2
});
```
O perfil fornece feed e atraso de perfuração; valores da mesa devem ser medidos.
Para incluir IHS/gases/retração por contorno, informe `pierceTime` medido.
## Dependências e integrações
[Tabela](./hprCarbonSteelRecipes.ts), API pública e catálogo de máquinas.
