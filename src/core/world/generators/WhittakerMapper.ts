import { Biome } from '../Biome';

export class WhittakerMapper {
  /**
   * Traduce parámetros ambientales a un bioma específico.
   * @param elevation Elevación normalizada (0.0 a 1.0)
   * @param temperature Temperatura normalizada (0.0 a 1.0)
   * @param humidity Humedad normalizada (0.0 a 1.0)
   */
  public static mapToBiome(elevation: number, temperature: number, humidity: number): Biome {
    // 1. Zonas de alta elevación / clima extremo
    if (elevation > 0.75) {
      return Biome.createMountain();
    }
    if (temperature < 0.25) {
      return Biome.createTundra();
    }

    // 2. Climas Cálidos (Temperatura alta)
    if (temperature > 0.65) {
      if (humidity < 0.3) {
        return Biome.createDesert();
      }
      if (humidity > 0.7) {
        return Biome.createWetland();
      }
      return Biome.createGrassland();
    }

    // 3. Climas Templados
    if (humidity > 0.55) {
      return Biome.createForest();
    }
    
    if (humidity > 0.35) {
      return Biome.createGrassland();
    }

    // Por defecto en clima templado/seco
    return Biome.createGrassland();
  }
}