# Referências de tecnologia

## Visão geral
Barrel de constantes históricas preservadas pela API pública.
## Responsabilidades
Reexportar valores de módulos-folha, sem duplicar tabelas ou inicialização.
## Entradas e saídas
Não recebe entradas; expõe constantes de feeds, perfuração e parâmetros de movimento.
## Fluxo principal
A API principal reexporta este barrel; consumidores internos importam módulos-folha.
## Erros e casos-limite
As referências não identificam material, gás, potência nem receita ativa.
Não substituem a calibração física do equipamento.
## Exemplos
`import { RAPID_SPEED } from '@linkiez/glory-star-calculator';`
## Dependências e integrações
[Tabela de corte](./cuttingSpeeds.ts), [perfuração](./pierceTimes.ts) e constantes adjacentes.
