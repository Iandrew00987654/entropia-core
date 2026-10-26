import { Vector2D } from '../math/Vector2D';
import { Environment } from '../world/Environment';
import { BiomeType } from '../world/Biome';
import { Entity } from './Entity';
import type { State } from '../ai/State';

export abstract class Animal extends Entity {
  public velocity: Vector2D;
  public speed: number;
  public health: number;
  public maxHealth: number;

  // Metabolismo
  public energy: number;
  public maxEnergy: number;

  // Rol ecológico
  public isPredator: boolean = false;
  public allowedBiomes: BiomeType[] = [];

  // Máquina de Estados
  public currentState: State<any> | null = null;

  constructor(
    position: Vector2D,
    radius: number,
    speed: number,
    maxHealth: number,
    allowedBiomes: BiomeType[] = [],
    isPredator: boolean = false,
    maxEnergy: number = 100,
  ) {
    super(position, radius);
    this.velocity = new Vector2D(0, 0);
    this.speed = speed;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.maxEnergy = maxEnergy;
    this.energy = maxEnergy;
    this.allowedBiomes = allowedBiomes;
    this.isPredator = isPredator;
  }

  public changeState(newState: State<any>): void {
    if (this.currentState?.exit) {
      this.currentState.exit(this);
    }
    this.currentState = newState;
    if (this.currentState?.enter) {
      this.currentState.enter(this);
    }
  }

  public update(deltaTime: number, environment: Environment, entities: Entity[]): void {
    if (!this.isAlive) return;

    if (this.health <= 0) {
      this.die();
      return;
    }

    // 1. Delegación a la Máquina de Estados
    if (this.currentState) {
      this.currentState.update(this, deltaTime, environment, entities);
    }

    // 2. Desplazamiento cinemático
    this.move(deltaTime);
  }
  // 3. Consumo de energía con el tiempo

  public energyDrainRate: number = 4;

  protected move(deltaTime: number): void {
    const directionMagnitude = this.velocity.multiply(this.speed * deltaTime);
    this.position = this.position.add(directionMagnitude);
    
    // Si el animal se está moviendo, consume energía
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      this.energy = Math.max(0, this.energy - this.energyDrainRate * deltaTime);
    }
  }

  public takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }

  /**
   * Comprueba si un tipo de bioma es transitable para este animal.
   */
  public isBiomeAllowed(biomeType: BiomeType): boolean {
    if (this.allowedBiomes.length === 0) return true; // Si está vacío, puede ir a cualquier parte
    return this.allowedBiomes.includes(biomeType);
  }

  /**
   * Control de confinamiento: evita bordes del mapa y biomas no permitidos.
   * Evalúa los ejes X e Y por separado con predicción por radio.
   * @returns true si hubo un rebote/colisión
   */
  public keepInBoundsAndBiome(environment: Environment, deltaTime: number): boolean {
    let bounced = false;

    const stepX = this.velocity.x * this.speed * deltaTime;
    const stepY = this.velocity.y * this.speed * deltaTime;

    // Margen de seguridad basado en el radio físico
    const marginX = this.velocity.x !== 0 ? Math.sign(this.velocity.x) * this.radius : 0;
    const marginY = this.velocity.y !== 0 ? Math.sign(this.velocity.y) * this.radius : 0;

    // --- 1. Predicción en Eje X ---
    const nextX = this.position.x + stepX + marginX;
    const probePosX = new Vector2D(nextX, this.position.y);
    const cellX = environment.getCellFromWorldPos(probePosX);

    const outOfBoundsX = nextX <= this.radius || nextX >= environment.width - this.radius;
    const invalidBiomeX = !cellX || !this.isBiomeAllowed(cellX.biome.type);

    if (outOfBoundsX || invalidBiomeX) {
      this.velocity = new Vector2D(-this.velocity.x, this.velocity.y);
      bounced = true;
    }

    // --- 2. Predicción en Eje Y ---
    const nextY = this.position.y + stepY + marginY;
    const probePosY = new Vector2D(this.position.x, nextY);
    const cellY = environment.getCellFromWorldPos(probePosY);

    const outOfBoundsY = nextY <= this.radius || nextY >= environment.height - this.radius;
    const invalidBiomeY = !cellY || !this.isBiomeAllowed(cellY.biome.type);

    if (outOfBoundsY || invalidBiomeY) {
      this.velocity = new Vector2D(this.velocity.x, -this.velocity.y);
      bounced = true;
    }

    return bounced;
  }

  public abstract draw(ctx: CanvasRenderingContext2D): void;
}