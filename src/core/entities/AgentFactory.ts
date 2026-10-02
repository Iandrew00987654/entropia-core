import { Vector2D } from '../math/Vector2D';
import { Entity } from '../entities/Entity';
import { Grass } from '../entities/plants/Grass';
import { Tree } from '../entities/plants/Tree';
import { Environment } from '../world/Environment';
import { BiomeType } from '../world/Biome'; // Ajusta la ruta a tu archivo Biome
import { Rabbit } from '../entities/animals/Rabbit';
import { Fox } from '../entities/animals/Fox';

export class AgentFactory {
  // --- 1. Métodos Puros de Creación ---
  
  public static createGrass(position: Vector2D): Grass {
    return new Grass(position);
  }

  public static createTree(position: Vector2D): Tree {
    return new Tree(position);
  }
  public static createRabbit(position: Vector2D): Rabbit {
  return new Rabbit(position);
}

  public static createFox(position: Vector2D): Fox {
  return new Fox(position);
}   

  // --- 2. Generador de Población Inicial ---
  public static createInitialPopulation(environment: Environment): Entity[] {
    const initialEntities: Entity[] = [];

    for (let r = 0; r < environment.rows; r++) {
      for (let c = 0; c < environment.cols; c++) {
        const cell = environment.getCell(c, r);
        if (!cell) continue;

        const position = environment.getCellCenterWorldPos(c, r);
        const randPlant = Math.random();
        const randAnimal = Math.random(); // Probabilidad separada para animales
        
        let newPlant: Entity | null = null;
        let newAnimal: Entity | null = null;

        // 1. Generación de vegetación (como ya lo teníamos)
        if (cell.canGrowPlant()) {
          if (cell.biome.type === BiomeType.FOREST) {
            if (randPlant < 0.30) newPlant = this.createTree(position);
            else if (randPlant < 0.55) newPlant = this.createGrass(position);
          } else if (cell.biome.type === BiomeType.GRASSLAND) {
            if (randPlant < 0.40) newPlant = this.createGrass(position);
            else if (randPlant < 0.45) newPlant = this.createTree(position);
          } else if (cell.biome.type === BiomeType.WETLAND) {
            if (randPlant < 0.35) newPlant = this.createGrass(position);
          }
        }

        // 2. Generación de animales
        if (cell.biome.type === BiomeType.FOREST) {
          if (randAnimal < 0.05) newAnimal = this.createRabbit(position);      // 5% de que haya un conejo
          else if (randAnimal < 0.06) newAnimal = this.createFox(position);    // 1% de que haya un zorro
        } else if (cell.biome.type === BiomeType.GRASSLAND) {
          if (randAnimal < 0.08) newAnimal = this.createRabbit(position);      // 8% de que haya un conejo
          else if (randAnimal < 0.09) newAnimal = this.createFox(position);    // 1% de que haya un zorro
        }

        // 3. Añadir a la lista de entidades a renderizar
        if (newPlant) {
          cell.setPlant(newPlant);
          initialEntities.push(newPlant);
        }
        
        if (newAnimal) {
          // Nota: Los animales no se registran en la celda como las plantas, 
          // solo se añaden al motor porque se mueven libremente.
          initialEntities.push(newAnimal);
        }
      }
    }

    return initialEntities;
  }
}