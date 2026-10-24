# Glory Star GS3015 Cutting Time Calculator

Biblioteca em TypeScript para estimar o tempo de corte de SVG e DXF para a máquina
GloryStar_GS3015, com opções explícitas de receita e espessura.

## Instalação

### Instalação via GitHub Packages

Este pacote é publicado no GitHub Packages. Para instalá-lo, primeiro configure o `.npmrc`:

```bash
echo "@linkiez:registry=https://npm.pkg.github.com" >> .npmrc
```

Em seguida, configure a autenticação criando um token do GitHub com permissão `read:packages` e adicione ao `.npmrc`:

```bash
echo "//npm.pkg.github.com/:_authToken=SEU_GITHUB_TOKEN" >> .npmrc
```

Agora você pode instalar o pacote:

```bash
npm install @linkiez/glory-star-calculator
```

Ou com yarn:

```bash
yarn add @linkiez/glory-star-calculator
```

## Recursos

- Cálculo de tempo de corte baseado em arquivos SVG
- Tabela de referência de 0,5 mm a 12,7 mm; outras espessuras exigem receita explícita
- Estimativa considerando:
  - Velocidade de corte específica para cada espessura
  - Tempo de perfuração
  - Tempo de movimento (posicionamento)
  - Otimização geométrica de caminho (não substitui o planejamento do CAM)
- Leitura de DXF: linhas, arcos, círculos, polilinhas com bulge e blocos INSERT planares
- Seleção explícita de receita de `DB_Laser.csv`, sem misturar materiais pela espessura
- Suporte para elementos SVG comuns (linhas, retângulos, círculos, polígonos, caminhos)
- Extensível para outras máquinas de corte

## Uso Básico

```typescript
import { calculateCuttingTimeFromSvg } from '@linkiez/glory-star-calculator';

// Cálculo a partir de string SVG
const svgString = `
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="80" fill="none" stroke="black" />
</svg>
`;

const result = calculateCuttingTimeFromSvg(svgString, {
  materialThickness: 5.0, // espessura da chapa em mm
  optimize: true // opcional: otimiza o caminho de corte
});

console.log(`Tempo total de corte: ${result.totalTimeSec} segundos`);
console.log(`Distância de corte: ${result.cuttingDistance} mm`);
```

### Node.js: cálculo a partir de arquivo SVG

Se você estiver usando Node.js, pode importar a função específica:

```typescript
import { calculateCuttingTimeFromFile } from '@linkiez/glory-star-calculator/dist/node';

const fileResult = calculateCuttingTimeFromFile('/caminho/para/arquivo.svg', {
  materialThickness: 3.0
});

console.log(`Tempo total para arquivo: ${fileResult.totalTimeSec} segundos`);
```

## API

### Funções Principais

#### `calculateCuttingTimeFromSvg(svgString, options)`

Calcula o tempo de corte a partir de uma string SVG.

- **svgString**: String contendo o SVG
- **options**: Opções de cálculo (veja abaixo)
- **Retorna**: Objeto com os resultados do cálculo

#### `calculateCuttingTimeFromFile(filePath, options)`

Calcula o tempo de corte a partir de um arquivo SVG.

- **filePath**: Caminho para o arquivo SVG
- **options**: Opções de cálculo
- **Retorna**: Objeto com os resultados do cálculo

### Opções

```typescript
interface CuttingTimeOptions {
  materialThickness: number;     // Espessura do material (mm) [OBRIGATÓRIO]
  kerf?: number;                 // Largura do corte (mm)
  leadIn?: number;               // Comprimento de entrada (mm)
  leadOut?: number;              // Comprimento de saída (mm)
  piercingType?: 'normal' | 'flying'; // Tipo de perfuração
  optimize?: boolean;            // Otimizar caminho de corte
  scaleFactor?: number;          // Escala geométrica, nunca calibração de tempo
  cuttingSpeed?: number;         // Velocidade da receita, mm/min
  pierceTime?: number;           // Ciclo de perfuração por contorno, segundos
  rapidSpeed?: number;           // Posicionamento, mm/min
  accelerationMmPerSec2?: number;// Aceleração opcional, mm/s²
  setupTimeSec?: number;         // Setup uma vez por trabalho (padrão: 1,5 s)
}
```

### Resultados

```typescript
interface CuttingTimeResult {
  totalTimeSec: number;        // Tempo total (segundos)
  cuttingTimeSec: number;      // Tempo de corte efetivo
  movementTimeSec: number;     // Tempo de posicionamento
  piercingTimeSec: number;     // Tempo de perfuração
  setupTimeSec: number;        // Tempo de setup
  totalDistance: number;       // Distância total percorrida (mm)
  cuttingDistance: number;     // Distância de corte (mm)
  movementDistance: number;    // Distância de posicionamento (mm)
  pierceCount: number;         // Número de perfurações
  partCount: number;           // Compatibilidade: número de contornos, não peças físicas
}
```

## Exemplo Completo

Execute `npm run example` para os exemplos em [examples/cuttingTime.ts](./examples/cuttingTime.ts).

## Estrutura e desenvolvimento

```text
src/
  index.ts                 API universal (Facade)
  node.ts                  API de filesystem
  adapters/node/           leitura de arquivos (Adapter)
  calculation/             validação, planejamento e estratégias de tempo
  formats/dxf/             DXF → movimentos em mm
  formats/svg/             SVG → movimentos em mm
  geometry/                distância, tolerância e limites
  models/                  contratos compartilhados
  technology/              seleção CSV e referências
fixtures/
  drawings/                DXFs de validação
  technology/DB_Laser.csv   exportação de receitas
test/                      testes por responsabilidade e regras arquiteturais
examples/                  exemplos executáveis
tools/                     diagnóstico DXF
docs/                      estudo técnico e publicação
```

O motor não depende de parsers ou filesystem. Os formatos compartilham o pipeline
de cálculo e limites; a Strategy funcional seleciona o modelo de movimento uma
vez por trabalho, sem hierarquias de classes. As referências e tolerâncias têm
fontes únicas.

```bash
npm run typecheck
npm test -- --runInBand
npm run test:coverage -- --runInBand
npm run build
npm run example
npm run inspect:dxf -- fixtures/drawings/LPEL-1530.dxf 3
```

O typecheck inclui biblioteca, testes, exemplos e ferramentas. O build usa
[tsconfig.build.json](./tsconfig.build.json) e emite somente a biblioteca em
`dist`; desenhos, CSV, exemplos e diagnósticos não fazem parte do pacote.

### Migração de imports internos

Os módulos antigos `cuttingCalculator`, `svgProcessor`, `types` e `constants`
na raiz de `src` não são pontos de entrada suportados. Substitua deep imports
por imports de `@linkiez/glory-star-calculator`. Os 19 exports de runtime da API
principal são preservados. Funções de filesystem continuam separadas em
`@linkiez/glory-star-calculator/dist/node`; `TechnologySelection` também está
disponível como tipo pela API principal.

O CSV de desenvolvimento está em
[fixtures/technology/DB_Laser.csv](./fixtures/technology/DB_Laser.csv), não em `src`.

## Receita da máquina

```typescript
import { getLaserTechnologyOptions, calculateCuttingTimeFromDxf } from '@linkiez/glory-star-calculator';

// csvContent e dxfContent são strings carregadas pelo aplicativo.
const recipe = getLaserTechnologyOptions(csvContent, {
  code: '3030',            // Exemplo: confirmar CODE efetivamente usado
  cutProfile: 'A',
  pierceProfile: 'A',
  pierceTimeUnit: 'ms'     // Escolha explícita: confirmar na exportação/CAM
});
const result = calculateCuttingTimeFromDxf(dxfContent, {
  ...recipe,
  optimize: true,
  setupTimeSec: 0         // Comparação apenas com o ciclo, sem setup
});
```

O CSV contém 83 receitas, com códigos numéricos de materiais/gases e múltiplos
perfis. Não identifica a unidade de perfuração nem quais estágios estão ativos.
`ms` converte 30 em 0,03 s; `cs` em 0,30 s; `s` em 30 s. Não são somados
automaticamente os perfis A–F. Para perfuração em estágios, forneça em `pierceTime`
o ciclo completo confirmado na máquina. O CSV não é incorporado ao pacote.

## Precisão e limites

- [Estudo técnico, evidências e validação](./docs/cutting-time-study.md).
- A geometria dos quatro DXFs fornecidos é testada contra comprimentos analíticos,
  com erro relativo inferior a 0,01%. Isso **não comprova** precisão do tempo real.
- Sem receita explícita, velocidades e perfurações usam a tabela de referência,
  que não identifica material, gás ou potência. As funções de consulta mantêm
  interpolação e saturação nos extremos; o cálculo rejeita espessuras fora da
  tabela quando faltam parâmetros explícitos.
- Aceleração informada usa um perfil triangular/trapezoidal por contorno contínuo
  e por deslocamento. Sem ela, aplica-se a referência de 0,2 s por contorno ou
  deslocamento com pelo menos 5 mm. Não existe penalização por subdivisão de curva.
- Reduções em cantos, jerk, subida/descida de Z, sopro, microjuntas, nesting e
  estratégias do controlador não são simulados. É necessário validar com o CAM
  e medições reais antes de utilizar a estimativa para prazo/custo.
- `leadIn`/`leadOut` são comprimentos em mm acrescentados uma vez por contorno, à
  velocidade de corte. Não geram geometria para o posicionamento ou bounding box.
- `kerf` não multiplica comprimento nem tempo. Compensação de contorno deve ser
  feita no CAM; a biblioteca mede a linha central fornecida.
- DXF sem `$INSUNITS` ou com unidade 0 assume mm. Unidades declaradas suportadas
  são convertidas antes de `scaleFactor`. O primeiro ponto DXF é o início do
  trabalho, sem deslocamento inicial desconhecido da máquina.
- SVG unitless mantém a convenção CAD de 1 unidade = 1 mm. `viewBox` com dimensões
  físicas absolutas define a escala. Com percentuais sem viewport externo,
  preserva-se 1 unidade = 1 mm; informe `scaleFactor` se necessário. Sem `viewBox`,
  viewport com unidade física usa pixels CSS (96 dpi). Atributos geométricos
  devem ser numéricos nas unidades do desenho.
- SVG aceita comandos M/L/H/V/C/S/Q/T/A/Z, subpaths e transformações. CSS
  geométrico, `use`, máscaras, recortes e SVG aninhado são rejeitados; converta
  antes para caminhos. Definições e elementos explicitamente ocultos não cortam.
- DXF aceita geometrias planares citadas acima. Splines, elipses e extrusões não
  suportadas geram erro em vez de um orçamento parcial; converta para arcos/linhas.
- `optimize` usa vizinho mais próximo por contorno e não garante corte interno
  antes do externo. Para reproduzir o CAM, forneça os movimentos na ordem real
  com `optimize: false`.

## Licença

ISC

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Versionamento e Publicação

Este projeto utiliza [semantic-release](https://github.com/semantic-release/semantic-release) para versionamento automático e publicação.

### Formato de Commits

Use o formato [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade (incrementa versão minor)
- `fix:` - Correção de bug (incrementa versão patch)
- `chore:` - Tarefas de manutenção (sem incremento de versão)
- `docs:` - Mudanças na documentação (sem incremento de versão)

Para breaking changes, adicione `!` após o tipo ou `BREAKING CHANGE:` no corpo do commit para incrementar a versão major.

Consulte o [guia de publicação](./docs/releasing/semantic-release.md) para mais detalhes.
