export enum BiomeType {
  FOREST = 'Forest',
  GRASSLAND = 'Grassland',
  DESERT = 'Desert',
  MOUNTAIN = 'Mountain',
  TUNDRA = 'Tundra',
  WETLAND = 'Wetland',
}

export class Biome {
  private readonly _type: BiomeType;
  private readonly _name: string;
  private readonly _color: string;
  private readonly _fertilityRate: number; // Tasa de regeneración de plantas (0.0 a 1.0)

  constructor(type: BiomeType, name: string, color: string, fertilityRate: number) {
    this._type = type;
    this._name = name;
    this._color = color;
    this._fertilityRate = fertilityRate;
  }

  // Getters para mantener los atributos privados e inmutables
  public get type(): BiomeType { return this._type; }
  public get name(): string { return this._name; }
  public get color(): string { return this._color; }
  public get fertilityRate(): number { return this._fertilityRate; }

  /**
   * Métodos Factory para instanciar rápidamente los biomas predefinidos
   */
  public static createForest(): Biome {
    return new Biome(BiomeType.FOREST, 'Bosque', '#215d24', 0.8);
  }

  public static createGrassland(): Biome {
    return new Biome(BiomeType.GRASSLAND, 'Pradera', '#78d810', 0.9);
  }

  public static createDesert(): Biome {
    return new Biome(BiomeType.DESERT, 'Desierto', '#e5c158', 0.1);
  }

  public static createMountain(): Biome {
    return new Biome(BiomeType.MOUNTAIN, 'Montaña', '#ffffff', 0.2);
  }

  public static createTundra(): Biome {
    return new Biome(BiomeType.TUNDRA, 'Tundra', '#089ae3', 0.15);
  }

  public static createWetland(): Biome {
    return new Biome(BiomeType.WETLAND, 'Pantano', '#74360a', 0.75);
  }
}