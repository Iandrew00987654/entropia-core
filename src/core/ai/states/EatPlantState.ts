import type { State } from '../State';
import { Animal } from '../../entities/Animal';
import { Environment } from '../../world/Environment';
import { Entity } from '../../entities/Entity';
import { Plant } from '../../entities/Plant';
import { Vector2D } from '../../math/Vector2D';

export class EatPlantState implements State<Animal> {
  public readonly name = 'EATING';
  public targetPlant: Plant | null = null;
  public eatingTimer: number = 0;
  public readonly requiredDuration: number = 7.0; // 7 segundos simulados

  public enter(agent: Animal): void {
    this.eatingTimer = this.requiredDuration;
  }

  public exit(agent: Animal): void {
    // Si sale de este estado (por ejemplo, para huir), se descarta el objetivo
    this.targetPlant = null;
    this.eatingTimer = 0;
  }

  public setTarget(plant: Plant): void {
    this.targetPlant = plant;
    this.eatingTimer = this.requiredDuration;
  }

  public update(agent: Animal, deltaTime: number, environment: Environment, entities: Entity[]): void {
    // 1. Detección prioritaria de depredadores
    if (this.detectThreat(agent, entities)) {
      if ((agent as any).fleeState) {
        agent.changeState((agent as any).fleeState);
      }
      return;
    }

    // 2. Si la planta fue consumida o destruida antes de llegar
    if (!this.targetPlant || !this.targetPlant.isAlive) {
      if ((agent as any).wanderState) {
        agent.changeState((agent as any).wanderState);
      }
      return;
    }

    const dist = agent.distanceTo(this.targetPlant);
    const contactDistance = agent.radius + this.targetPlant.radius + 2;

    // 3. Desplazamiento hacia la planta si aún está lejos
    if (dist > contactDistance) {
      const dir = this.targetPlant.position.subtract(agent.position);
      const mag = Math.hypot(dir.x, dir.y);
      if (mag > 0) {
        agent.velocity = new Vector2D(dir.x / mag, dir.y / mag);
      }
      agent.keepInBoundsAndBiome(environment, deltaTime);
      return;
    }

    // 4. Contacto establecido: detener al animal y procesar los 7 segundos
    agent.velocity = new Vector2D(0, 0);
    this.eatingTimer -= deltaTime;

    if (this.eatingTimer <= 0) {
      this.targetPlant.die(); // La planta desaparece
      agent.energy = Math.min(agent.maxEnergy, agent.energy + 40);
      agent.health = Math.min(agent.maxHealth, agent.health + 15);

      if ((agent as any).wanderState) {
        agent.changeState((agent as any).wanderState);
      }
    }
  }

  private detectThreat(agent: Animal, entities: Entity[]): boolean {
    for (const entity of entities) {
      if (entity instanceof Animal && entity.isPredator && entity.isAlive) {
        if (agent.distanceTo(entity) < 100) return true;
      }
    }
    return false;
  }
}