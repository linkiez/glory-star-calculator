# loadSvgFile

## Visão geral
Adaptador síncrono de leitura de SVG para Node.js.
## Responsabilidades
Obter texto do filesystem sem interpretar nem modificar geometria.
## Entradas e saídas
Caminho de arquivo → string UTF-8.
## Fluxo principal
Delega diretamente a `readFileSync(filePath, 'utf8')`.
## Erros e casos-limite
Propaga erros do filesystem, incluindo arquivo inexistente e acesso negado.
## Exemplos
`const svg = loadSvgFile('/drawings/part.svg');`
## Dependências e integrações
`node:fs`; reexportado pela [API Node](../../node.ts).
