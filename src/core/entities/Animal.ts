import { Vector2D } from '../math/Vector2D';
import { Environment } from '../world/Environment';
import { Entity } from './Entity';

export abstract class Animal extends Entity {
  public velocity: Vector2D; // Dirección de movimiento normalizada
  public speed: number;      // Píxeles por segundo
  public health: number;
  public maxHealth: number;

  constructor(position: Vector2D, radius: number, speed: number, maxHealth: number) {
    super(position, radius);
    this.velocity = new Vector2D(0, 0); // Empieza quieto
    this.speed = speed;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
  }

  public update(deltaTime: number, environment: Environment): void {
    if (!this.isAlive) return;

    if (this.health <= 0) {
      this.die();
      return;
    }

    this.move(deltaTime);
  }

  /**
   * Maneja el desplazamiento físico en el mundo.
   * position = position + (velocity * speed * dt)
   */
  protected move(deltaTime: number): void {
    // Si la velocidad es (0,0), el vector de desplazamiento será (0,0)
    const directionMagnitude = this.velocity.multiply(this.speed * deltaTime);
    this.position = this.position.add(directionMagnitude);
  }

  /**
   * Recibe daño y muere si la salud llega a 0.
   */
  public takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }

  // Subclases como Rabbit o Wolf implementarán su propia forma de dibujarse
  public abstract draw(ctx: CanvasRenderingContext2D): void;
}