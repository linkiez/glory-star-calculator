# getMachineProfile

## Visão geral
Resolução validada de perfil, sem fallback entre máquinas.
## Responsabilidades
Validar identificadores e devolver a configuração imutável do catálogo.
## Entradas e saídas
`MachineProfileId` opcional → `MachineProfile`; omissão seleciona Glory Star.
## Fluxo principal
Verifica chave própria no catálogo e retorna o perfil correspondente.
## Erros e casos-limite
Identificador desconhecido, incluindo chaves herdadas de objetos, gera erro.
Perfil existente sem parâmetros continua sem parâmetros; não consulta rede.
## Exemplos
`getMachineProfile('talvi-6000w-raytools').parameterStatus` retorna `requires-parameters`.
## Dependências e integrações
[Catálogo](./machineProfiles.ts), consultas de referência e resolver de cálculo.
