export interface LayerGenerator {
  /**
   * Genera un valor numérico normalizado entre 0.0 y 1.0 para una posición dada.
   * @param x Coordenada X en la matriz
   * @param y Coordenada Y en la matriz
   * @returns valor entre 0.0 y 1.0
   */
  getValue(x: number, y: number): number;
}