# Checklist de parâmetros — Talvi 6000 W / Raytools

Use esta lista para o operador exportar e enviar os dados da máquina sem ambiguidades.

## 1) Identificação da configuração

- Nome da máquina no CNC/HMI
- Modelo da fonte/cabeçote (confirmar versão exata do Raytools)
- Data da exportação
- Unidade usada em cada coluna (mm, mm/min, s, ms, A, bar)

## 2) Parâmetros obrigatórios por receita de corte

Para cada combinação de **material + espessura + corrente + gás + processo**, enviar:

| Campo | Obrigatório | Unidade | Observação |
|---|---|---|---|
| material | Sim | texto | Ex.: aço carbono |
| espessura | Sim | mm | Valor exato da tabela |
| corrente | Sim | A | Corrente do processo |
| gás plasma | Sim | texto | Ex.: O2 |
| gás proteção | Sim | texto | Ex.: Air |
| velocidade de corte | Sim | mm/min | Valor final de produção |
| tempo de perfuração (normal) | Sim | s | Não confundir com edge pierce |
| tempo de perfuração de borda (se houver) | Recomendado | s | Informar separado |
| kerf/largura de corte | Sim | mm | Valor usado no processo |
| altura de perfuração | Recomendado | mm | Se disponível na tabela |
| altura de corte | Recomendado | mm | Se disponível na tabela |
| atraso altura de corte | Recomendado | s | Se disponível na tabela |

## 3) Parâmetros de movimento da mesa (globais)

Enviar os valores reais da máquina:

- `rapidSpeed` (mm/min)
- `setupTimeSec` (s) por peça/programa
- `accelerationMmPerSec2` (mm/s²)

> Sem esses 3 valores, o perfil calcula corte/perfuração, mas não representa corretamente deslocamentos e ciclo completo.

## 4) Filtros para exportação correta

- Incluir somente processos que o operador usa em produção.
- Separar por tecnologia:
  - Corte convencional
  - True Hole
  - Chanfro
  - Submerso
- Não mesclar linhas de tecnologias diferentes na mesma receita.

## 5) Formato de envio

- Preferência: XLSX/CSV exportado do CNC, sem edição manual.
- Se possível, enviar também captura da tela de parâmetros da receita.
- Manter os nomes originais das colunas.

## 6) Validação antes de enviar

- [ ] Todas as unidades informadas
- [ ] Tempo de perfuração normal separado de edge pierce
- [ ] Velocidade em mm/min (não em %)
- [ ] Espessuras exatas (sem arredondar)
- [ ] Parâmetros globais da mesa preenchidos
