# Receitas HPR400XD — aço carbono O₂/ar

## Visão geral
43 referências discretas de 2 a 50 mm, selecionadas para priorizar acabamento da borda
por menor corrente disponível na tabela, não por velocidade máxima.
O conjunto não é uma classificação certificada de qualidade da HPR400XD.

## Responsabilidades
Conservar os parâmetros da mesma receita e identificar a linha de origem.
Não reduzir velocidades por percentual arbitrário nem misturar correntes.

## Entradas e saídas
`HPR_CARBON_STEEL_RECIPES` contém registros imutáveis de
[HprCarbonSteelRecipe](./HprCarbonSteelRecipe.ts).
Os tempos estão em segundos, conforme confirmação do usuário.

## Fluxo principal
1. Considerar a aba `Cut`, material `MS`, classes convencionais exatas
   `80Amp O2/Air`, `130Amp O2/Air`, `200Amp O2/Air`, `260Amp O2/Air` e `400Amp O2/Air`.
2. Exigir `Profile Type`, `Diameter` e `Profile Area` iguais a `*`.
3. Escolher a menor corrente disponível para cada espessura exata.
4. Preservar `Feedrate` (K), `Base Kerf` (M), `Cut Chart Current` (W)
   e `Pierce Time` (AG); excluir o tempo de borda AH.

Faixas resultantes, somente para espessuras efetivamente listadas:

| Espessura | Corrente |
|---|---|
| 2–20 mm | 80 A |
| 21–26 mm | 130 A |
| 27–32 mm | 260 A |
| 33–50 mm | 400 A |

200 A não ganha uma faixa nessa política: suas espessuras também têm receita de
menor corrente. As receitas 30/50 A usam O₂/O₂ e não pertencem ao pedido O₂/ar.
True Hole, chanfro, True Bevel, submerso e início somente pela borda são excluídos.

## Erros e casos-limite
Há lacunas como 6,35, 39, 41 e 46 mm: não interpolar nem saturar extremos.
Velocidade baixa pode aumentar escória; menor corrente não garante o melhor
resultado físico. Consumíveis, altura, gases, geometria e estado da mesa exigem
validação no equipamento. O perfil serve para estimativa, não programação da máquina.
O atraso AG não inclui todos os movimentos/IHS/gases; use overrides medidos para
estimar o ciclo completo. Rápido, setup e aceleração não são inferidos da fonte plasma.

## Exemplos
`getHprCarbonSteelRecipe(12)` retorna 80 A / 1410 mm/min / 0,7 s / kerf 2 mm,
linha 678. `getHprCarbonSteelRecipe(50)` retorna 400 A / 795 mm/min / 5,2 s,
linha 3471. Essas durações não são os tempos de borda 0,35 s e 2,6 s.

## Dependências e integrações
Fonte local: `Phoenix 9_761 HPR260XDa (Cut, TrueHole, V500, V600, M50N, RT, HS) MM.xlsx`,
na pasta fornecida `Hypertherm HPR400XD`.
SHA-256: `9b8c179fc36e907b0c0ebfa76d0d5a03b524ceb3ea146519c63597c68f9694cb`.
Apesar do nome HPR260XDa, há receitas de até 400 A e identificação `HPR XD`;
isso não certifica que o arquivo seja o ajuste da mesa HPR400XD do usuário.
Os PDFs fornecidos estão vazios e não confirmam calibração.

Fundamento da política: [orientação geral da Hypertherm sobre correntes e qualidade](https://xnet.hypertherm.com/docs/en/XPR300_IM/ipu1699974653664.html),
consultada em 26/10/2026: correntes menores favorecem acabamento da borda;
correntes maiores favorecem velocidade e ausência de escória.
Essa página trata de XPR, não fornece faixas numéricas HPR; nenhuma categoria
PCT nem velocidade XPR é transferida. Os números usados vêm exclusivamente da planilha local.
[HPR400XD oficial](https://www.hypertherm.com/hypertherm/hyperformance/hyperformance-hpr400xd/).
