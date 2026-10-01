import type { LayerGenerator } from './LayerGenerator';

interface Seed {
  x: number;
  y: number;
  value: number;
}

export class VoronoiLayerGenerator implements LayerGenerator {
  private seeds: Seed[] = [];
  
  // Estado para nuestro generador de números pseudoaleatorios (PRNG)
  private currentSeed: number;
  private warpFactor: number;

  /**
   * @param gridColumns Número total de columnas de la cuadrícula.
   * @param gridRows Número total de filas de la cuadrícula.
   * @param numSeeds Cantidad de puntos de control.
   * @param seed Valor base para hacer la generación predecible y fija.
   * @param warpFactor Intensidad de la distorsión de las fronteras.
   */
  constructor(gridColumns: number, gridRows: number, numSeeds: number, seed: number = 12345, warpFactor: number = 4.0) {
    this.currentSeed = seed;
    this.warpFactor = warpFactor;

    for (let i = 0; i < numSeeds; i++) {
      this.seeds.push({
        // Usamos nuestro PRNG en lugar de Math.random() para que siempre sea igual
        x: Math.floor(this.random() * gridColumns),
        y: Math.floor(this.random() * gridRows),
        value: this.random() 
      });
    }
  }

  /**
   * Generador Congruencial Lineal (LCG) muy básico y rápido.
   * Devuelve un número determinista entre 0.0 y 1.0.
   */
  private random(): number {
    this.currentSeed = (this.currentSeed * 9301 + 49297) % 233280;
    return this.currentSeed / 233280;
  }

  /**
   * Ruido continuo muy barato usando senos y cosenos.
   */
  private cheapNoise(x: number, y: number): number {
    // Al combinar distintas frecuencias logramos un patrón ondulado menos repetitivo
    return Math.sin(x * 0.05) + Math.cos(y * 0.05) + Math.sin((x + y) * 0.02);
  }

  /**
   * Obtiene el valor del diagrama de Voronoi para una CELDA específica.
   */
  public getValue(gridX: number, gridY: number): number {
    let minDistance = Infinity;
    let closestValue = 0;

    // Domain Warping: Distorsionamos las coordenadas base de la celda
    // Se aplican offsets distintos a X e Y para que el ruido no sea diagonal
    const warpX = gridX + this.cheapNoise(gridX, gridY) * this.warpFactor;
    const warpY = gridY + this.cheapNoise(gridY, gridX) * this.warpFactor;

    for (const seed of this.seeds) {
      // Calculamos la distancia usando las coordenadas distorsionadas
      const dist = Math.hypot(seed.x - warpX, seed.y - warpY);
      
      if (dist < minDistance) {
        minDistance = dist;
        closestValue = seed.value;
      }
    }

    return closestValue;
  }
}