# MachineProfileId

## Visão geral
Identificadores estáveis dos perfis de máquina.
## Responsabilidades
Impedir seleção de máquinas inexistentes em consumidores TypeScript.
## Entradas e saídas
União `glory-star-gs3015 | talvi-6000w-raytools | hypertherm-hpr400xd`.
## Fluxo principal
O consumidor informa o identificador em `CuttingTimeOptions.machineProfile`.
## Erros e casos-limite
Chamadores JavaScript são validados por [getMachineProfile](./getMachineProfile.ts).
## Exemplos
`const machineProfile: MachineProfileId = 'talvi-6000w-raytools';`
## Dependências e integrações
API pública, catálogo e opções compartilhadas por SVG, DXF e Node.
