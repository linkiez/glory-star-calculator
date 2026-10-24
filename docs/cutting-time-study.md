# Estudo técnico: geometria e estimativa de tempo de corte

## Visão geral

A biblioteca estima tempo; não reproduz o controlador da GS3015. A validação
geométrica e a calibração temporal são problemas distintos. Corrigir escala para
atingir um tempo-alvo altera a peça e não constitui calibração válida.

## Responsabilidades e escopo da revisão

O fluxo revisado inclui API pública, cálculo, importadores SVG/DXF, tabela
CSV, constantes, exemplos, scripts de diagnóstico, testes, build e publicação.
O foco das correções é a integridade do comprimento, dos contornos e do tempo.
Arquivos CAD/CSV originais são preservados como evidência.

### Falhas reproduzidas

| Caso | Resultado defeituoso reproduzido | Referência verificável |
| --- | ---: | ---: |
| Arco DXF de 90°, raio 10 mm | 0,274156 mm | 15,707963 mm |
| Quadrado fornecido, espessura 3 mm | 1100 mm com kerf implícito | 1000 mm |
| LPEL-1530, importador original | 189,647737 mm | 474,514417 mm |
| Polilinha fechada 3–4–5 | 7 mm | 12 mm |
| Semicírculo por bulge, diâmetro 20 mm | 20 mm | 31,415927 mm |

Também há regressões cobrindo: deslocamentos entre cortes sem otimização,
contornos que se tocam, setup por trabalho, subdivisão de segmentos, escala antes
do cálculo, comandos relativos/curvos SVG, subpaths, matrizes, `viewBox`, blocos
DXF, unidades, entrada inválida e seleção de receita.

O parser `dxf-parser` entrega ângulos de ARC em **radianos**. O fechamento de
polilinhas é `shape`; INSERT usa `position`, escalas e rotação. Esses contratos
foram conferidos no código da dependência instalada, não inferidos do texto DXF.

## Entradas e saídas

Todos os comprimentos internos estão em mm; feeds em mm/min; tempos em segundos.
`calculateCuttingTime` recebe movimentos ordenados, preserva contornos explícitos
e insere deslocamentos nos intervalos. SVG/DXF são convertidos antes do cálculo.

O resultado separa corte, posicionamento, perfuração e setup. `partCount`
mantém o significado histórico de **contornos/perfurações**, não de peças físicas:
um furo também é um contorno. Setup não é multiplicado por essa contagem.

## Fluxo principal e modelo temporal

1. Validar geometria e parâmetros; transformar unidades e escala geométrica.
2. Formar contornos; opcionalmente ordenar por vizinho mais próximo.
3. Somar comprimentos contínuos antes de estimar aceleração.
4. Acrescentar entrada/saída por contorno, perfurações e um setup por trabalho.
5. Calcular dimensões apenas da geometria de corte, com escala.

Sem aceleração calibrada:

`Tmov = 60 × comprimento / feed + overhead`

O overhead de referência é 0,2 s para contornos/deslocamentos de pelo menos 5 mm,
não para cada segmento produzido pela aproximação de uma curva.

Com `accelerationMmPerSec2 = a`, `v = feed / 60` e distância `d`:

- `d <= v²/a`: `Tmov = 2 × sqrt(d/a)` (perfil triangular).
- Caso contrário: `Tmov = d/v + v/a` (perfil trapezoidal).
- Cada contorno/deslocamento parte e termina em repouso neste modelo simplificado.

`Ttotal = Tcorte + Tposicionamento + Nperfurações × Tperfuração + Tsetup`

Não se simula look-ahead, desaceleração em cada canto, jerk, Z, sopro,
microjuntas, múltiplas passadas ou estratégias reais de nesting/CAM.
`leadIn` e `leadOut` são comprimentos adicionais na velocidade de corte,
não caminhos geométricos. `kerf` não é um fator percentual de comprimento.

## DB_Laser.csv: seleção e incertezas

São 83 receitas, 2326 colunas e 83 códigos CODE distintos. Há códigos de material
0, 1, 2, 4 e 8; o arquivo não fornece uma legenda confiável desses códigos.
Material, gás, perfil e receita não podem ser determinados somente pela espessura.
Exemplo: CODE 3030 / perfil A / 3 mm tem feed 3400; CODE 2003 / perfil A /
3 mm tem feed 4500.

`getLaserTechnologyOptions` exige CODE, perfil de corte, perfil de perfuração e
unidade de tempo. `A_CUT_FEED` é utilizado como mm/min. Não se seleciona a
primeira receita de uma espessura nem se faz média entre receitas.

O arquivo não declara unidades de `*_PIERCE_TIME`, a máquina ativa ou os estágios
de perfuração habilitados. A informação do usuário foi “mili eu acho”, portanto
**milissegundos é uma hipótese, não uma confirmação**. Para o valor 30:
`ms = 0,03 s`, `cs = 0,30 s`, `s = 30 s`. O consumidor deve escolher explicitamente.
Perfuração em estágios requer o ciclo total confirmado, sem somar indiscriminadamente
as colunas A–F. Velocidade rápida e aceleração também exigem dados da máquina.

## Evidência numérica e casos-limite

Execução com tabela de referência, espessura 3 mm, escala 1 e otimização:

| DXF | Comprimento analítico (mm) | Calculado (mm) | Perfurações | Tempo total (s) |
| --- | ---: | ---: | ---: | ---: |
| quadrado | 1000,000000 | 1000,000000 | 1 | 19,647 |
| redondo | 1000,029493 | 1000,026320 | 1 | 19,648 |
| LPEL-0040 | 605,389372 | 605,389063 | 3 | 15,532 |
| LPEL-1530 | 474,514417 | 474,513344 | 2 | 11,489 |

O critério automatizado é erro relativo de comprimento **< 0,01%** nos quatro
arquivos, com e sem otimização. Contornos circulares usam passos de até 0,5°.

Os alvos registrados nos exemplos não têm receita/condições de medição anexas.
Não podem ser tratados como calibração confirmada:

| Espessura no quadrado (mm) | Alvo registrado (s) | Modelo de referência (s) | Diferença (s) |
| --- | ---: | ---: | ---: |
| 1,5 | 17 | 17,100 | +0,100 |
| 3 | 23 | 19,647 | -3,353 |
| 6,35 | 44 | 38,428 | -5,572 |
| 12,7 | 73 | 74,559 | +1,559 |

A divergência de tempo restante é explícita. Não há garantia de “bater com a
máquina” sem confirmar receita e ciclo real. Para calibrar, registrar por peça:
DXF, CODE/perfis, unidades, material/gás/potência, velocidade/override,
perfuração completa, aceleração, ordem CAM e o intervalo cronometrado
(somente ciclo ou também carga/descarga/setup).

Geometrias/recursos não suportados geram erro em vez de resultado parcial.
As unidades e limitações de SVG/DXF estão no [README](../README.md#precisão-e-limites).
Os formatos aceitos não constituem suporte geral a qualquer documento CAD.

## Exemplos e validação

O [README](../README.md#receita-da-máquina) mostra como fornecer a receita.
[cuttingTime.ts](../examples/cuttingTime.ts) compara alvos sem deformar a geometria.

```sh
npm test -- --runInBand
npm run typecheck
npm run test:coverage -- --runInBand
npm run build
npm run example
npm pack --dry-run --ignore-scripts
```

A suíte cobre regressões numéricas, arquitetura e adaptadores de filesystem.
`test:coverage` mede a biblioteca; exemplos e diagnósticos ficam fora do build.
Os testes não exigem acesso à internet nem à máquina.

O `package-lock.json` existente diverge do manifesto: `npm ci` falha antes de
executar os testes. Na verificação local, as dependências foram restauradas sem
alterar lockfiles. O CI existente usa Yarn. A correção de lockfiles/dependências
não faz parte da calibração e não foi misturada às alterações de cálculo.

## Dependências, integrações e fontes

- [BOCHU/FSCUT — Quote and Production Report](https://www.bochu.com/tutorials/report-for-pricing-and-production/):
  o fabricante relaciona corte, perfuração, deslocamento e sopro; orienta usar
  aceleração, velocidades e parâmetros de gás iguais aos da máquina. Fundamenta
  a necessidade de receita/configuração real, não fornece a calibração desta GS3015.
- [Autodesk — LWPOLYLINE DXF](https://help.autodesk.com/cloudhelp/2023/ENU/AutoCAD-DXF/files/GUID-748FC305-F3F2-4F74-825A-61F04D757A50.htm):
  flag de fechamento no grupo 70 e bulge no grupo 42.
- [W3C — SVG Paths](https://www.w3.org/TR/SVG2/paths.html):
  comandos relativos, curvas e subpaths.
- [W3C — Elliptical arc implementation notes](https://www.w3.org/TR/SVG2/implnote.html#ArcConversionEndpointToCenter):
  conversão de parâmetros de arcos, correção de raios e orientação.
- Dependências de implementação: `dxf-parser`, `svg-parser` e `@svgdotjs/svg.js`
  já presentes no projeto. Nenhuma dependência nova é necessária.

Consulta pública realizada em 24/10/2026. Código e dados do repositório não
foram enviados aos serviços de pesquisa.
