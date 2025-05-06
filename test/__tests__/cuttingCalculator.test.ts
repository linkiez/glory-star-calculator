import {
  calculateDistance,
  getCuttingSpeed,
  getPierceTime,
  calculateCuttingTimeFromSvg,
  calculateCuttingTime
} from '../../src/cuttingCalculator';
import { Movement, Point, CuttingTimeOptions } from '../../src/types';

describe('GloryStar Cutting Calculator', () => {
  // Teste para cálculo de distância
  describe('calculateDistance', () => {
    it('deve calcular corretamente a distância entre dois pontos', () => {
      const point1: Point = { x: 0, y: 0 };
      const point2: Point = { x: 3, y: 4 };
      expect(calculateDistance(point1, point2)).toBe(5);
    });

    it('deve retornar 0 para pontos idênticos', () => {
      const point: Point = { x: 10, y: 20 };
      expect(calculateDistance(point, point)).toBe(0);
    });
  });

  // Teste para função de obtenção de velocidade de corte
  describe('getCuttingSpeed', () => {
    it('deve retornar a velocidade correta para espessuras na tabela', () => {
      expect(getCuttingSpeed(1.0)).toBe(7000);
      expect(getCuttingSpeed(5.0)).toBe(2200);
      expect(getCuttingSpeed(10.0)).toBe(1100);
    });

    it('deve interpolar velocidades para espessuras intermediárias', () => {
      // Interpolar entre 1.0mm (7000mm/min) e 1.5mm (6000mm/min)
      const speed1_25 = getCuttingSpeed(1.25);
      expect(speed1_25).toBeGreaterThan(6000);
      expect(speed1_25).toBeLessThan(7000);

      // Verificar se a interpolação está próxima do valor esperado
      expect(Math.abs(speed1_25 - 6500)).toBeLessThan(100);
    });

    it('deve lidar com espessuras fora do intervalo definido', () => {
      // Espessura menor que a menor na tabela (0.5mm)
      expect(getCuttingSpeed(0.1)).toBe(getCuttingSpeed(0.5));

      // Espessura maior que a maior na tabela (30.0mm)
      expect(getCuttingSpeed(35.0)).toBe(getCuttingSpeed(30.0));
    });
  });

  // Teste para função de obtenção de tempo de perfuração
  describe('getPierceTime', () => {
    it('deve retornar o tempo correto para espessuras na tabela', () => {
      expect(getPierceTime(1.0)).toBe(0.3);
      expect(getPierceTime(5.0)).toBe(1.1);
      expect(getPierceTime(15.0)).toBe(3.5);
    });

    it('deve interpolar tempos para espessuras intermediárias', () => {
      // Interpolar entre 5.0mm (1.1s) e 6.0mm (1.3s)
      const time5_5 = getPierceTime(5.5);
      expect(time5_5).toBeGreaterThan(1.1);
      expect(time5_5).toBeLessThan(1.3);
      
      // Verificar interpolação
      expect(Math.abs(time5_5 - 1.2)).toBeLessThan(0.05);
    });
  });

  // Teste para cálculo de tempo de corte
  describe('calculateCuttingTime', () => {
    it('deve calcular corretamente o tempo para uma sequência simples de movimentos', () => {
      const movements: Movement[] = [
        { start: { x: 0, y: 0 }, end: { x: 0, y: 10 }, isCutting: false },
        { start: { x: 0, y: 10 }, end: { x: 10, y: 10 }, isCutting: true },
        { start: { x: 10, y: 10 }, end: { x: 10, y: 0 }, isCutting: true },
        { start: { x: 10, y: 0 }, end: { x: 0, y: 0 }, isCutting: true },
      ];

      const options: CuttingTimeOptions = {
        materialThickness: 1.0,
        optimize: false
      };

      const result = calculateCuttingTime(movements, options);
      
      // Verificações básicas
      expect(result.totalTimeSec).toBeGreaterThan(0);
      expect(result.cuttingDistance).toBe(30); // 10 + 10 + 10
      expect(result.movementDistance).toBe(10);
      expect(result.pierceCount).toBe(1);
      expect(result.partCount).toBe(1);
    });

    it('deve retornar valores zerados para uma lista vazia de movimentos', () => {
      const result = calculateCuttingTime([], { materialThickness: 1.0 });
      expect(result.totalTimeSec).toBe(0);
      expect(result.cuttingDistance).toBe(0);
      expect(result.pierceCount).toBe(0);
    });
  });

  // Teste para processamento de SVG
  describe('calculateCuttingTimeFromSvg', () => {
    it('deve processar um SVG simples', () => {
      const simpleSvg = `
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="black" />
        </svg>
      `;

      const options: CuttingTimeOptions = {
        materialThickness: 1.0,
        optimize: false
      };

      const result = calculateCuttingTimeFromSvg(simpleSvg, options);
      
      // Verificações básicas para o retângulo
      expect(result.pierceCount).toBeGreaterThan(0);
      expect(result.cuttingDistance).toBeGreaterThan(0);
      expect(result.totalTimeSec).toBeGreaterThan(0);
    });

    it('deve retornar resultado vazio para SVG sem elementos de corte', () => {
      const emptySvg = `
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <text x="10" y="20">Sem elementos de corte</text>
        </svg>
      `;
      
      const options: CuttingTimeOptions = {
        materialThickness: 1.0
      };

      const result = calculateCuttingTimeFromSvg(emptySvg, options);
      
      // Para um SVG sem elementos de corte, esperamos valores zerados
      expect(result.pierceCount).toBe(0);
      expect(result.cuttingDistance).toBe(0);
      expect(result.totalTimeSec).toBe(0);
    });

    it('deve lidar com SVG extremamente malformado', () => {
      // String completamente aleatória que não é nem XML válido
      const invalidSvg = 'isto não é um SVG nem mesmo um XML {}[]<>';
      
      const options: CuttingTimeOptions = {
        materialThickness: 1.0
      };

      expect(() => {
        calculateCuttingTimeFromSvg(invalidSvg, options);
      }).toThrow();
    });
  });
});