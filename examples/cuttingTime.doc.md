# Exemplos e comparação

## Visão geral
Demonstra SVG, DXF e alvos registrados sem ajustar artificialmente a escala.
## Responsabilidades
Exibir distâncias, dimensões, tempos e diferenças em relação aos alvos.
## Entradas e saídas
SVGs embutidos e DXFs em `fixtures/drawings`; decomposição no console.
## Fluxo principal
Calcular com escala 1 → apresentar decomposição → comparar com referências.
## Erros e casos-limite
Alvos não têm receita validada anexada. Não são garantia de medição física.
Falhas de leitura ou cálculo encerram a execução, em vez de aparentar sucesso.
## Exemplos
`npm run example`.
## Dependências e integrações
API pública, arquivos CAD locais e [estudo técnico](../docs/cutting-time-study.md).
