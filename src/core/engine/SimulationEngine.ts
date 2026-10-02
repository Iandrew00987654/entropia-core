import { Environment } from '../world/Environment';
import { Entity } from '../entities/Entity';

export class SimulationEngine {
  public environment: Environment;
  
  // Lista centralizada de todos los organismos (plantas y animales)
  private entities: Entity[] = [];

  // Variables de control de tiempo (Preparando el Punto 10 de tu roadmap)
  public simulationTime: number = 0;
  public timeScale: number = 1.0; // Para acelerar o pausar la simulación (1x, 2x, 5x, 0x)

  constructor(environment: Environment) {
    this.environment = environment;
  }

  /**
   * Registra una nueva entidad en la simulación.
   */
  public addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  /**
   * Bucle principal de lógica (Tick).
   * Debe llamarse en cada frame antes de dibujar.
   * @param realDeltaTime Tiempo real transcurrido desde el último frame.
   */
  public update(realDeltaTime: number): void {
    // Aplicamos la velocidad de simulación al tiempo real
    const scaledDeltaTime = realDeltaTime * this.timeScale;
    
    // Acumulamos el tiempo total de simulación
    this.simulationTime += scaledDeltaTime;

    // Iteramos en reversa para poder eliminar entidades muertas 
    // de forma segura sin alterar los índices del array durante el bucle.
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i]!;

      // Si la entidad murió (ya sea de hambre, cazada o por el bioma), la sacamos
      if (!entity.isAlive) {
        this.entities.splice(i, 1);
        continue;
      }

      // Actualizamos la entidad pasándole el tiempo escalado y el mundo
      entity.update(scaledDeltaTime, this.environment);
    }
  }

  /**
   * Bucle principal de renderizado.
   * Dibuja primero el terreno y luego las entidades encima.
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    // 1. El entorno limpia el canvas, aplica su propia cámara y dibuja el mapa (Biomas + Grid)
    this.environment.draw(ctx);

    // 2. Para dibujar las entidades correctamente, necesitamos aplicar la misma
    // transformación de cámara (offset y zoom) que usa el Environment.
    ctx.save();
    ctx.translate(this.environment.offset.x, this.environment.offset.y);
    ctx.scale(this.environment.zoom, this.environment.zoom);

    // 3. Renderizamos todas las entidades
    for (const entity of this.entities) {
      entity.draw(ctx);
    }

    ctx.restore();
  }

  /**
   * Retorna información estadística de la simulación.
   */
  public getStats() {
    return {
      totalEntities: this.entities.length,
      time: this.simulationTime.toFixed(2),
      // Más adelante puedes separar conteos por subclases (ej. instanceof Animal)
    };
  }
}