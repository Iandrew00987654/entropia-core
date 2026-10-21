import  type { State } from '../State';
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
    // 1. Sensor de amenazas (prioridad máxima)
    if (this.hasNearbyThreat(agent, entities)) {
      if ((agent as any).fleeState) {
        agent.changeState((agent as any).fleeState);
      }
      return;
    }

    // 2. Necesidad de alimentarse
    if (agent.energy < 80) {
      const food = this.findNearestEdiblePlant(agent, entities);
      if (food && (agent as any).eatState) {
        (agent as any).eatState.setTarget(food);
        agent.changeState((agent as any).eatState);
        return;
      }
    }

    // 3. Rutina de vagar
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
      if (entity instanceof Animal && entity.isPredator && entity.isAlive) {
        if (agent.distanceTo(entity) < 100) return true;
      }
    }
    return false;
  }

  private findNearestEdiblePlant(agent: Animal, entities: Entity[]): Plant | null {
    let nearest: Plant | null = null;
    let minDist = this.visionRadius;

    for (const entity of entities) {
      // Se alimenta de hierba que haya crecido lo suficiente
      if (entity instanceof Grass && entity.isAlive && entity.growth >= 0.4) {
        const d = agent.distanceTo(entity);
        if (d < minDist) {
          minDist = d;
          nearest = entity;
        }
      }
    }
    return nearest;
  }
}