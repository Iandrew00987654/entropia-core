import type { State } from '../State';
import { Animal } from '../../entities/Animal';
import { Environment } from '../../world/Environment';
import { Entity } from '../../entities/Entity';
import { Plant } from '../../entities/Plant';
import { Grass } from '../../entities/plants/Grass';
import { Vector2D } from '../../math/Vector2D';

export class WanderState implements State<Animal> {
  public readonly name = 'WANDERING';
  private wanderTimer: number = 0;
  private readonly visionRadius: number = 140;

  public update(agent: Animal, deltaTime: number, environment: Environment, entities: Entity[]): void {
    // 1. Detección de amenazas (SOLO para herbívoros, ignorando depredadores como el zorro)
    if (!agent.isPredator && this.hasNearbyThreat(agent, entities)) {
      if ((agent as any).fleeState) {
        agent.changeState((agent as any).fleeState);
      }
      return;
    }

    // 2. Agotamiento físico (ambas especies van a descansar si la energía es muy baja)
    if (agent.energy < 20) {
      if ((agent as any).restState) {
        agent.changeState((agent as any).restState);
        return;
      }
    }

    // 3. Alimentación / Caza según rol ecológico
    if (agent.energy < 80) {
      if (agent.isPredator) {
        // LÓGICA DEL ZORRO: Rastrear conejos
        const prey = this.findNearestPrey(agent, entities, environment);
        if (prey && (agent as any).chaseState) {
          (agent as any).chaseState.setTarget(prey);
          agent.changeState((agent as any).chaseState);
          return;
        }
      } else {
        // LÓGICA DEL CONEJO: Rastrear hierba (respetando biomas permitidos)
        const food = this.findNearestEdiblePlant(agent, entities, environment);
        if (food && (agent as any).eatState) {
          (agent as any).eatState.setTarget(food);
          agent.changeState((agent as any).eatState);
          return;
        }
      }
    }

    // 4. Rutina de vagar
    this.wanderTimer -= deltaTime;
    if (this.wanderTimer <= 0) {
      const angle = Math.random() * Math.PI * 2;
      agent.velocity = new Vector2D(Math.cos(angle), Math.sin(angle));
      this.wanderTimer = 1.5 + Math.random() * 2;
    }

    if (agent.keepInBoundsAndBiome(environment, deltaTime)) {
      this.wanderTimer = 0.5;
    }
  }

  private hasNearbyThreat(agent: Animal, entities: Entity[]): boolean {
    for (const entity of entities) {
      // 🛡️ CRUCIAL: 'entity !== agent' evita que el animal se asuste de sí mismo
      if (entity !== agent && entity instanceof Animal && entity.isPredator && entity.isAlive) {
        if (agent.distanceTo(entity) < 100) return true;
      }
    }
    return false;
  }

  private findNearestEdiblePlant(agent: Animal, entities: Entity[], environment: Environment): Plant | null {
    let nearest: Plant | null = null;
    let minDist = this.visionRadius;

    for (const entity of entities) {
      if (entity instanceof Grass && entity.isAlive && entity.growth >= 0.4) {
        const plantCell = environment.getCellFromWorldPos(entity.position);
        if (!plantCell || !agent.isBiomeAllowed(plantCell.biome.type)) {
          continue;
        }

        const d = agent.distanceTo(entity);
        if (d < minDist) {
          minDist = d;
          nearest = entity;
        }
      }
    }
    return nearest;
  }

  private findNearestPrey(agent: Animal, entities: Entity[], environment: Environment): Animal | null {
    let nearest: Animal | null = null;
    let minDist = 180; // Rango de visión para detectar presas

    for (const entity of entities) {
      // Busca herbívoros vivos que estén dentro de un bioma transitable para el zorro
      if (entity !== agent && entity instanceof Animal && !entity.isPredator && entity.isAlive) {
        const cell = environment.getCellFromWorldPos(entity.position);
        if (cell && agent.isBiomeAllowed(cell.biome.type)) {
          const d = agent.distanceTo(entity);
          if (d < minDist) {
            minDist = d;
            nearest = entity;
          }
        }
      }
    }
    return nearest;
  }
}