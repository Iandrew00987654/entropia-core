import { Biome } from './Biome';

export const BIOME_DATA: Record<string, Biome> = {
  F: Biome.createForest(),
  G: Biome.createGrassland(),
  D: Biome.createDesert(),
  M: Biome.createMountain(),
  T: Biome.createTundra(),
  W: Biome.createWetland()
};