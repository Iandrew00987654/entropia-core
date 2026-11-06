import { Environment } from '../world/Environment';
import { Entity } from '../entities/Entity';
import { DayNightSystem } from './DayNightSystem';
import { CanvasHUD } from '../ui/CanvasHUD';

export class SimulationEngine {
  public environment: Environment;
  private entities: Entity[] = [];

  // Controles de simulación y tiempo
  public simulationTime: number = 0;
  public timeScale: number = 1.0;
  public isPaused: boolean = false;

  // Subsistemas
  public dayNightSystem: DayNightSystem;
  public canvasHUD: CanvasHUD;

  constructor(environment: Environment) {
    this.environment = environment;
    this.dayNightSystem = new DayNightSystem();
    this.canvasHUD = new CanvasHUD();
  }

  public addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  public togglePause(): void {
    this.isPaused = !this.isPaused;
  }

  /**
   * Conecta los eventos de click del canvas a la UI flotante.
   */
  public attachInputListeners(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Intenta procesar el click en la UI
      const handled = this.canvasHUD.handleClick(mouseX, mouseY, this);
      
      if (handled) {
        // El click fue consumido por un botón de la UI (no afecta al mapa)
        event.stopPropagation();
      }
    });
  }

  public update(realDeltaTime: number): void {
    // Si la simulación está pausada, el delta escalado es cero
    const scaledDeltaTime = this.isPaused ? 0 : realDeltaTime * this.timeScale;
    
    this.simulationTime += scaledDeltaTime;

    // 1. Actualizar el ciclo Día/Noche
    this.dayNightSystem.update(scaledDeltaTime);

    // 2. Si está pausado, omitimos el movimiento de las entidades
    if (this.isPaused) return;

    // 3. Actualizar entidades (iteración inversa segura)
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i]!;

      if (!entity.isAlive) {
        this.entities.splice(i, 1);
        continue;
      }

      entity.update(scaledDeltaTime, this.environment, this.entities);
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    // 1. Terreno y Biomas (con su propia transformación de cámara)
    this.environment.draw(ctx);

    // 2. Entidades (con transformación de cámara)
    ctx.save();
    ctx.translate(this.environment.offset.x, this.environment.offset.y);
    ctx.scale(this.environment.zoom, this.environment.zoom);

    for (const entity of this.entities) {
      entity.draw(ctx);
    }
    ctx.restore();

    // 3. Filtro ambiental de Noche (Cubre todo el canvas antes de la UI)
    this.dayNightSystem.drawNightFilter(ctx, ctx.canvas.width, ctx.canvas.height);

    // 4. UI Flotante HUD (Siempre al frente, brillante e inmóvil)
    this.canvasHUD.draw(ctx, this);
  }

  public getStats() {
    return {
      totalEntities: this.entities.length,
      time: this.simulationTime.toFixed(2),
      day: this.dayNightSystem.currentDay,
      clock: this.dayNightSystem.getFormattedTime(),
      isNight: this.dayNightSystem.isNight
    };
  }
}