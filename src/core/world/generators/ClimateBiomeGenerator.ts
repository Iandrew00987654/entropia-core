import { Biome } from '../Biome';
import  type { LayerGenerator } from './LayerGenerator';
import { WhittakerMapper } from './WhittakerMapper';

export class ClimateBiomeGenerator {
  private readonly elevationLayer: LayerGenerator;
  private readonly temperatureLayer: LayerGenerator;
  private readonly humidityLayer: LayerGenerator;

  constructor(
    elevationLayer: LayerGenerator,
    temperatureLayer: LayerGenerator,
    humidityLayer: LayerGenerator
  ) {
    this.elevationLayer = elevationLayer;
    this.temperatureLayer = temperatureLayer;
    this.humidityLayer = humidityLayer;
  }

  /**
   * Determina el bioma para una posición en el mapa consultando las 3 capas.
   */
  public generateBiomeAt(x: number, y: number): Biome {
    const elevation = this.elevationLayer.getValue(x, y);
    const temperature = this.temperatureLayer.getValue(x, y);
    const humidity = this.humidityLayer.getValue(x, y);

    return WhittakerMapper.mapToBiome(elevation, temperature, humidity);
  }
}