import type { State } from '../State';
import { Animal } from '../../entities/Animal';
import { Environment } from '../../world/Environment';
import { Entity } from '../../entities/Entity';
import { Vector2D } from '../../math/Vector2D';

export class FleeState implements State<Animal> {
  public readonly name = 'FLEEING';
  private readonly fleeDistance: number;

  constructor(fleeDistance: number = 100) {
    this.fleeDistance = fleeDistance;
  }

  public update(agent: Animal, deltaTime: number, environment: Environment, entities: Entity[]): void {
    const danger = this.findNearestPredator(agent, entities);

    if (!danger) {
      // Peligro superado: regresa a vagar (asume que el animal expone su wanderState)
      if ((agent as any).wanderState) {
        agent.changeState((agent as any).wanderState);
      }
      return;
    }

    // Vector de huida contrario a la amenaza
    const away = agent.position.subtract(danger.position);
    const mag = Math.hypot(away.x, away.y);
    if (mag > 0) {
      agent.velocity = new Vector2D(away.x / mag, away.y / mag);
    }

    agent.keepInBoundsAndBiome(environment, deltaTime);
  }

  private findNearestPredator(agent: Animal, entities: Entity[]): Animal | null {
    let nearest: Animal | null = null;
    let minDist = this.fleeDistance;

    for (const entity of entities) {
      if (entity instanceof Animal && entity.isPredator && entity.isAlive) {
        const dist = agent.distanceTo(entity);
        if (dist < minDist) {
          minDist = dist;
          nearest = entity;
        }
      }
    }
    return nearest;
  }
}