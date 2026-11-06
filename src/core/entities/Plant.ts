import { Vector2D } from '../math/Vector2D';
import { Environment } from '../world/Environment';
import { Entity } from './Entity';

export abstract class Plant extends Entity {
  public growth: number;
  public growthRate: number;
  public maxRadius: number;

  constructor(position: Vector2D, maxRadius: number, growthRate: number) {
    super(position, maxRadius * 0.2);
    this.maxRadius = maxRadius;
    this.growthRate = growthRate;
    this.growth = 0.0;
  }

  public update(deltaTime: number, _environment: Environment, _entities: Entity[]): void {
    if (!this.isAlive) return;

    this.age += deltaTime;

    if (this.growth < 1.0) {
      this.growth += this.growthRate * deltaTime;
      if (this.growth > 1.0) this.growth = 1.0;
      this.radius = this.maxRadius * (0.2 + (this.growth * 0.8));
    }
  }

  public abstract draw(ctx: CanvasRenderingContext2D): void;
}