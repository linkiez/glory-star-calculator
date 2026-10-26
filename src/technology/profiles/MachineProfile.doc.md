# MachineProfile

## Visão geral
Contrato imutável de identidade e parâmetros disponíveis por máquina.
## Responsabilidades
Isolar referências Glory Star, identidade Talvi e receitas HPR400XD de aço carbono.
## Entradas e saídas
Identidade, potência em W, fabricante do cabeçote e estado dos parâmetros.
Tabelas por espessura em mm; feeds em mm/min, tempos em segundos,
aceleração em mm/s² e limites geométricos em mm.
`maxCurrentA`, `material`, `plasmaGas` e `shieldGas` descrevem a fonte plasma.
`exactThicknessOnly` proíbe interpolação/saturação de receitas discretas.
## Fluxo principal
O resolver combina overrides do trabalho com valores do perfil selecionado.
## Erros e casos-limite
Ausência de parâmetro não significa zero nem autoriza herdar de outra máquina.
`reference` indica referências de estimativa, não calibração física confirmada.
`requires-parameters` indica que o chamador deve fornecer os parâmetros.
HPR400XD contém referências de processo, mas exige dados explícitos de movimento
e setup da mesa; `reference` não significa que todo parâmetro esteja disponível.
## Exemplos
`getMachineProfile('talvi-6000w-raytools').laserPowerW` retorna `6000`.
## Dependências e integrações
[Identificador](./MachineProfileId.ts) e [catálogo](./machineProfiles.ts).
