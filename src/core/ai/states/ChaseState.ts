import type { State } from '../State';
import { Animal } from '../../entities/Animal';
import { Environment } from '../../world/Environment';
import { Entity } from '../../entities/Entity';
import { Vector2D } from '../../math/Vector2D';

export class ChaseState implements State<Animal> {
  public readonly name = 'CHASING';
  public targetPrey: Animal | null = null;

  private readonly maxChaseDistance: number = 220; // Rango de pérdida de rastro
  private readonly sprintSpeedMultiplier: number = 1.35; // Sprint del depredador
  private baseSpeed: number = 0;

  public enter(agent: Animal): void {
    this.baseSpeed = agent.speed;
    agent.speed = this.baseSpeed * this.sprintSpeedMultiplier; // Acelerar
    agent.energyDrainRate = 5; // Correr a fondo agota rápidamente
  }

  public exit(agent: Animal): void {
    agent.speed = this.baseSpeed; // Restaurar velocidad normal
    agent.energyDrainRate = 4;
    this.targetPrey = null;
  }

  public setTarget(prey: Animal): void {
    this.targetPrey = prey;
  }

  public update(agent: Animal, deltaTime: number, environment: Environment, entities: Entity[]): void {
    // 1. Agotamiento físico: Si el zorro se queda sin estamina, abandona la cacería
    if (agent.energy < 15) {
      this.giveUp(agent);
      return;
    }

    // 2. Validar que la presa siga viva
    if (!this.targetPrey || !this.targetPrey.isAlive) {
      this.giveUp(agent);
      return;
    }

    // 3. Evaluar si la presa huyó a un bioma al que el zorro no puede entrar
    const preyCell = environment.getCellFromWorldPos(this.targetPrey.position);
    if (!preyCell || !agent.isBiomeAllowed(preyCell.biome.type)) {
      this.giveUp(agent);
      return;
    }

    const currentDist = agent.distanceTo(this.targetPrey);

    // 4. Si la presa escapó muy lejos, el zorro se rinde
    if (currentDist > this.maxChaseDistance) {
      this.giveUp(agent);
      return;
    }

    // 5. Oportunismo: ¿Hay otra presa considerablemente más cerca (un 40% más cerca)?
    const alternativePrey = this.findCloserPrey(agent, entities, currentDist * 0.6, environment);
    if (alternativePrey) {
      this.targetPrey = alternativePrey;
    }

    // 6. Captura exitosa (Contacto físico)
    const catchDistance = agent.radius + this.targetPrey.radius + 3;
    if (currentDist <= catchDistance) {
      this.catchPrey(agent, this.targetPrey);
      return;
    }

    // 7. Persecución vectorial: Dirigirse hacia la presa
    const dir = this.targetPrey.position.subtract(agent.position);
    const mag = Math.hypot(dir.x, dir.y);
    if (mag > 0) {
      agent.velocity = new Vector2D(dir.x / mag, dir.y / mag);
    }

    agent.keepInBoundsAndBiome(environment, deltaTime);
  }

  private catchPrey(predator: Animal, prey: Animal): void {
    prey.die(); // El conejo muere y el SimulationEngine lo limpiará

    // Recompensa nutricional para el zorro
    predator.energy = Math.min(predator.maxEnergy, predator.energy + 55);
    predator.health = Math.min(predator.maxHealth, predator.health + 20);

    this.giveUp(predator);
  }

  private giveUp(agent: Animal): void {
    // Si quedó exhausto va a descansar; si no, vuelve a patrullar
    if (agent.energy < 25 && (agent as any).restState) {
      agent.changeState((agent as any).restState);
    } else if ((agent as any).wanderState) {
      agent.changeState((agent as any).wanderState);
    }
  }

  private findCloserPrey(
    agent: Animal,
    entities: Entity[],
    thresholdDist: number,
    environment: Environment
  ): Animal | null {
    let closest: Animal | null = null;
    let minDist = thresholdDist;

    for (const entity of entities) {
      // Busca herbívoros vivos que no sean depredadores
      if (entity instanceof Animal && !entity.isPredator && entity.isAlive) {
        const cell = environment.getCellFromWorldPos(entity.position);
        if (cell && agent.isBiomeAllowed(cell.biome.type)) {
          const d = agent.distanceTo(entity);
          if (d < minDist) {
            minDist = d;
            closest = entity;
          }
        }
      }
    }
    return closest;
  }
}