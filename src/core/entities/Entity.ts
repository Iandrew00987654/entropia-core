import { Vector2D } from '../math/Vector2D';
import { Environment } from '../world/Environment';

export abstract class Entity {
  public readonly id: string;
  public position: Vector2D;
  public isAlive: boolean;
  public radius: number;
  public age: number = 0; // Tiempo total de vida simulada en segundos

  public abstract readonly speciesName: string;

  constructor(position: Vector2D, radius: number = 10) {
    this.id = crypto.randomUUID();
    this.position = position;
    this.radius = radius;
    this.isAlive = true;
  }

  public abstract update(
    deltaTime: number,
    environment: Environment,
    entities: Entity[]
  ): void;

  public abstract draw(ctx: CanvasRenderingContext2D): void;

  public die(): void {
    this.isAlive = false;
  }

  public distanceTo(target: Entity): number {
    return this.position.distance(target.position);
  }
}