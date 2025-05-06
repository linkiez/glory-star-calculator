/**
 * Teste para verificar o arredondamento de espessuras
 */

import { getCuttingSpeed, getPierceTime } from './cuttingCalculator';
import { CUTTING_SPEEDS, PIERCE_TIMES } from './constants';

// Função para exibir as espessuras disponíveis nas constantes
function mostrarEspessurasDisponiveis() {
  console.log('---------------------------------------------');
  console.log('Espessuras disponíveis nas constantes:');
  
  const espessuras = Object.keys(CUTTING_SPEEDS)
    .map(Number)
    .sort((a, b) => a - b);
    
  console.log(`Espessuras: ${espessuras.join(', ')} mm`);
  console.log('---------------------------------------------\n');
}

// Função para testar o arredondamento de espessuras
function testarArredondamento(espessura: number) {
  const velocidade = getCuttingSpeed(espessura);
  const tempoPerfuracao = getPierceTime(espessura);
  
  console.log(`Espessura informada: ${espessura} mm`);
  console.log(`Velocidade de corte: ${velocidade} mm/min`);
  console.log(`Tempo de perfuração: ${tempoPerfuracao} segundos`);
  
  // Encontrar qual espessura foi de fato usada
  let espessuraUtilizada = -1;
  for (const esp of Object.keys(CUTTING_SPEEDS).map(Number)) {
    if (CUTTING_SPEEDS[esp] === velocidade) {
      espessuraUtilizada = esp;
      break;
    }
  }
  
  console.log(`Espessura utilizada: ${espessuraUtilizada} mm`);
  console.log('---------------------------------------------\n');
}

// Mostrar todas as espessuras disponíveis
mostrarEspessurasDisponiveis();

console.log('TESTES DE ARREDONDAMENTO:\n');

// Testar espessuras exatas (que já existem nas constantes)
testarArredondamento(1.0);  // Deve usar exatamente 1.0mm
testarArredondamento(5.0);  // Deve usar exatamente 5.0mm
testarArredondamento(10.0); // Deve usar exatamente 10.0mm

// Testar espessuras intermediárias (que não existem nas constantes)
testarArredondamento(1.2);  // Deve arredondar para 1.5mm
testarArredondamento(2.7);  // Deve arredondar para 3.0mm
testarArredondamento(6.5);  // Deve arredondar para 8.0mm
testarArredondamento(11.3); // Deve arredondar para 12.0mm
testarArredondamento(13.9); // Deve arredondar para 15.0mm
testarArredondamento(24.2); // Deve arredondar para 25.0mm

// Testar limites
testarArredondamento(0.3);  // Deve usar 0.5mm (mínimo)
testarArredondamento(35.0); // Deve usar 30.0mm (máximo)