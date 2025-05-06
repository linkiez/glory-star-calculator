/**
 * Exemplo de uso da biblioteca GloryStar Calculator
 * 
 * Este arquivo demonstra como calcular o tempo de corte a partir de um arquivo SVG
 * para a máquina GloryStar_GS3015, considerando diferentes espessuras de chapa.
 */

import * as path from 'path';
import { 
  calculateCuttingTimeFromFile, 
  calculateCuttingTimeFromSvg,
  CuttingTimeOptions,
  CuttingTimeResult,
  loadSvgFile
} from './index';

// Exemplo de uso com um arquivo SVG
function exampleWithSvgFile(svgFilePath: string, materialThickness: number): void {
  try {
    console.log(`\nCalculando tempo de corte para arquivo: ${path.basename(svgFilePath)}`);
    console.log(`Espessura do material: ${materialThickness}mm`);
    
    // Configurações para o cálculo
    const options: CuttingTimeOptions = {
      materialThickness,
      optimize: true, // Otimiza o caminho de corte
      piercingType: 'normal',
      leadIn: 2.0, // mm
      leadOut: 1.5 // mm
    };
    
    // Calcula o tempo de corte a partir do arquivo
    const result = calculateCuttingTimeFromFile(svgFilePath, options);
    
    // Exibe os resultados
    displayResults(result);
  } catch (error) {
    console.error(`Erro ao processar arquivo: ${error}`);
  }
}

// Exemplo de uso com string SVG
function exampleWithSvgString(svgString: string, materialThickness: number): void {
  try {
    console.log(`\nCalculando tempo de corte para SVG fornecido como string`);
    console.log(`Espessura do material: ${materialThickness}mm`);
    
    // Configurações para o cálculo
    const options: CuttingTimeOptions = {
      materialThickness,
      optimize: true
    };
    
    // Calcula o tempo de corte a partir da string SVG
    const result = calculateCuttingTimeFromSvg(svgString, options);
    
    // Exibe os resultados
    displayResults(result);
  } catch (error) {
    console.error(`Erro ao processar SVG: ${error}`);
  }
}

// Função auxiliar para exibir os resultados
function displayResults(result: CuttingTimeResult): void {
  console.log('\n--- RESULTADOS DO CÁLCULO DE TEMPO ---');
  console.log(`Tempo total: ${formatTime(result.totalTimeSec)}`);
  console.log(`Tempo de corte: ${formatTime(result.cuttingTimeSec)}`);
  console.log(`Tempo de movimento: ${formatTime(result.movementTimeSec)}`);
  console.log(`Tempo de perfuração: ${formatTime(result.piercingTimeSec)}`);
  console.log(`Tempo de configuração: ${formatTime(result.setupTimeSec)}`);
  console.log('\n--- DISTÂNCIAS ---');
  console.log(`Distância total: ${result.totalDistance.toFixed(2)}mm`);
  console.log(`Distância de corte: ${result.cuttingDistance.toFixed(2)}mm`);
  console.log(`Distância de movimento: ${result.movementDistance.toFixed(2)}mm`);
  console.log('\n--- CONTAGENS ---');
  console.log(`Número de perfurações: ${result.pierceCount}`);
  console.log(`Número de peças: ${result.partCount}`);
  console.log('-----------------------------------');
}

// Função para formatar tempo em formato legível (hh:mm:ss)
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')} (${seconds.toFixed(2)}s)`;
}

// Exemplo de SVG simples para teste
const simpleSvg = `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="80" fill="none" stroke="black" />
  <circle cx="150" cy="50" r="30" fill="none" stroke="black" />
  <polyline points="10,120 50,140 90,120 130,140 170,120" fill="none" stroke="black" />
  <path d="M10,180 L50,160 Q90,190 130,160 L170,180 Z" fill="none" stroke="black" />
</svg>
`;

// Execute os exemplos com diferentes espessuras
console.log('=== EXEMPLOS DE CÁLCULO DE TEMPO DE CORTE ===');

// Exemplo com string SVG para diferentes espessuras
[1.0, 3.0, 5.0, 10.0, 15.0].forEach(thickness => {
  exampleWithSvgString(simpleSvg, thickness);
});

// Exemplo com arquivo SVG (descomente e ajuste o caminho conforme necessário)
// const svgFilePath = path.resolve(__dirname, '../examples/sample.svg');
// exampleWithSvgFile(svgFilePath, 5.0);