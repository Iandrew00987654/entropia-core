
//codigo de ia de mientras
import { Vector2D } from '../math/Vector2D';
import { Environment } from '../world/Environment';

export abstract class Entity {
  // Identificador único
  public readonly id: string;

  // Posición en el mundo 2D
  public position: Vector2D;

  // Estado de vida
  public isAlive: boolean;

  // Radio para detección de colisiones y renderizado
  public radius: number;

  constructor(position: Vector2D, radius: number = 10) {
    this.id = crypto.randomUUID();
    this.position = position;
    this.radius = radius;
    this.isAlive = true;
  }

  /**
   * Método abstracto para actualizar la lógica y el estado de la entidad en cada ciclo de la simulación.
   * Debe ser implementado obligatoriamente por las subclases.
   * @param deltaTime Tiempo transcurrido desde el último frame (en segundos).
   * @param environment Referencia al entorno donde habita la entidad.
   */
  public abstract update(deltaTime: number, environment: Environment): void;

  /**
   * Método abstracto para renderizar la entidad en el canvas.
   * @param ctx Contexto 2D del canvas.
   */
  public abstract draw(ctx: CanvasRenderingContext2D): void;

  /**
   * Cambia el estado de la entidad a muerta.
   */
  public die(): void {
    this.isAlive = false;
  }

  /**
   * Calcula la distancia euclidiana hacia otra entidad.
   * @param target Entidad de destino.
   */
  public distanceTo(target: Entity): number {
    return this.position.distance(target.position);
  }
}