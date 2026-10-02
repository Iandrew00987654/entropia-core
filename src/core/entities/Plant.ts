import { Vector2D } from '../math/Vector2D';
import { Environment } from '../world/Environment';
import { Entity } from './Entity';

export abstract class Plant extends Entity {
  public growth: number;      // Va de 0.0 (semilla) a 1.0 (adulta)
  public growthRate: number;  // Cuánto crece por segundo
  public maxRadius: number;   // Tamaño visual máximo cuando growth = 1.0

  constructor(position: Vector2D, maxRadius: number, growthRate: number) {
    // Inicializamos con un radio pequeño (semilla)
    super(position, maxRadius * 0.2); 
    this.maxRadius = maxRadius;
    this.growthRate = growthRate;
    this.growth = 0.0;
  }

  public update(deltaTime: number, environment: Environment): void {
    if (!this.isAlive) return;

    // Lógica de crecimiento gradual basada en el tiempo
    if (this.growth < 1.0) {
      this.growth += this.growthRate * deltaTime;
      
      // Limitamos el crecimiento a 1.0
      if (this.growth > 1.0) this.growth = 1.0;

      // Actualizamos el radio visual proporcional al crecimiento
      this.radius = this.maxRadius * (0.2 + (this.growth * 0.8));
    }
  }

  // Mantenemos draw() como abstracto para que Grass, Bush y Tree 
  // decidan su propio color y forma final.
  public abstract draw(ctx: CanvasRenderingContext2D): void;
}