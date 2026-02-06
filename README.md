# Glory Star GS3015 Cutting Time Calculator

Biblioteca em TypeScript para calcular o tempo de corte a partir de arquivos SVG para a máquina de corte a laser GloryStar_GS3015, considerando diferentes espessuras de chapa.

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
- Suporte para diferentes espessuras de material (0.5mm a 30mm)
- Cálculo preciso considerando:
  - Velocidade de corte específica para cada espessura
  - Tempo de perfuração
  - Tempo de movimento (posicionamento)
  - Otimização de caminho
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
  partCount: number;           // Número de peças
}
```

## Exemplo Completo

Veja o arquivo `src/example.ts` para um exemplo mais detalhado de utilização da biblioteca.

## Limitações

- A biblioteca implementa uma versão simplificada do parser de SVG, podendo não suportar todos os recursos avançados.
- Os tempos calculados são estimativas baseadas em dados da máquina GloryStar_GS3015 e podem variar em condições reais.
- Curvas complexas em caminhos SVG são aproximadas como segmentos lineares.

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

Consulte [SEMANTIC_RELEASE.md](SEMANTIC_RELEASE.md) para mais detalhes.
