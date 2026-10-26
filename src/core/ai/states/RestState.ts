import type { State } from '../State';
import { Animal } from '../../entities/Animal';
import { Environment } from '../../world/Environment';
import { Entity } from '../../entities/Entity';
import { Vector2D } from '../../math/Vector2D';

export class RestState implements State<Animal> {
  public readonly name = 'RESTING';
  private readonly recoveryRate: number = 15; // Recupera 15 de energía por segundo

  public enter(agent: Animal): void {
    agent.velocity = new Vector2D(0, 0); // Se queda quieto para reposar
  }

  public update(agent: Animal, deltaTime: number, _environment: Environment, entities: Entity[]): void {
    // 1. Alerta de depredador: Si viene un zorro, se despierta para huir
    if (this.hasNearbyThreat(agent, entities)) {
      if ((agent as any).fleeState) {
        agent.changeState((agent as any).fleeState);
      }
      return;
    }

    // 2. Asegurar que permanezca inmóvil
    agent.velocity = new Vector2D(0, 0);

    // 3. Recuperar energía gradualmente con el tiempo
    agent.energy = Math.min(agent.maxEnergy, agent.energy + this.recoveryRate * deltaTime);

    // 4. Si ya recuperó suficiente energía (> 85%), vuelve a explorar
    if (agent.energy >= 85) {
      if ((agent as any).wanderState) {
        agent.changeState((agent as any).wanderState);
      }
    }
  }

  private hasNearbyThreat(agent: Animal, entities: Entity[]): boolean {
    for (const entity of entities) {
      if (entity instanceof Animal && entity.isPredator && entity.isAlive) {
        if (agent.distanceTo(entity) < 110) return true;
      }
    }
    return false;
  }
}