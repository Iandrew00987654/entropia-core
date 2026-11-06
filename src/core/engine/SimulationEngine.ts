import { Environment } from '../world/Environment';
import { Entity } from '../entities/Entity';
import { DayNightSystem } from './DayNightSystem';
import { CanvasHUD } from '../ui/CanvasHUD';
import { Vector2D } from '../math/Vector2D';

export class SimulationEngine {
  public environment: Environment;
  public entities: Entity[] = [];

  public simulationTime: number = 0;
  public timeScale: number = 1.0;
  public isPaused: boolean = false;

  public dayNightSystem: DayNightSystem;
  public canvasHUD: CanvasHUD;

  // 🎯 Entidad actualmente seleccionada para el inspector
  public selectedEntity: Entity | null = null;

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
   * Intenta seleccionar una entidad bajo las coordenadas de clic en el mundo.
   * Utiliza un radio de tolerancia mínimo para facilitar el clic en pantallas de alta densidad.
   */
  public selectEntityAt(worldPos: Vector2D): Entity | null {
    // Buscamos de adelante hacia atrás (lo último dibujado está encima)
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i]!;
      if (!entity.isAlive) continue;

      const hitTolerance = Math.max(entity.radius * 1.5, 14);
      if (entity.position.distance(worldPos) <= hitTolerance) {
        this.selectedEntity = entity;
        return entity;
      }
    }

    this.selectedEntity = null;
    return null;
  }

  public update(realDeltaTime: number): void {
    const scaledDeltaTime = this.isPaused ? 0 : realDeltaTime * this.timeScale;
    this.simulationTime += scaledDeltaTime;

    this.dayNightSystem.update(scaledDeltaTime);

    if (this.isPaused) return;

    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i]!;

      if (!entity.isAlive) {
        if (this.selectedEntity?.id === entity.id) {
          // Si la entidad seleccionada muere, la mantenemos como referencia pero marcada
        }
        this.entities.splice(i, 1);
        continue;
      }

      entity.update(scaledDeltaTime, this.environment, this.entities);
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    // 1. Fondo del mundo
    this.environment.draw(ctx);

    // 2. Entidades con la cámara activa
    ctx.save();
    ctx.translate(this.environment.offset.x, this.environment.offset.y);
    ctx.scale(this.environment.zoom, this.environment.zoom);

    for (const entity of this.entities) {
      entity.draw(ctx);
    }

    // 🎯 Dibujar Retícula de Selección si hay una entidad marcada
    if (this.selectedEntity && this.selectedEntity.isAlive) {
      this.drawSelectionReticle(ctx, this.selectedEntity);
    }

    ctx.restore();

    // 3. Filtro nocturno
    this.dayNightSystem.drawNightFilter(ctx, ctx.canvas.width, ctx.canvas.height);

    // 4. HUD Superior
    this.canvasHUD.draw(ctx, this);
  }

  /**
   * Dibuja corchetes cibernéticos / retícula científica alrededor del espécimen seleccionado.
   */
  private drawSelectionReticle(ctx: CanvasRenderingContext2D, entity: Entity): void {
    ctx.save();
    const pos = entity.position;
    const r = Math.max(entity.radius + 6, 14);
    const bracketSize = Math.max(r * 0.45, 6);

    ctx.strokeStyle = '#38bdf8'; // Cyan brillante
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';

    // Esquina Superior Izquierda
    ctx.beginPath();
    ctx.moveTo(pos.x - r, pos.y - r + bracketSize);
    ctx.lineTo(pos.x - r, pos.y - r);
    ctx.lineTo(pos.x - r + bracketSize, pos.y - r);
    ctx.stroke();

    // Esquina Superior Derecha
    ctx.beginPath();
    ctx.moveTo(pos.x + r - bracketSize, pos.y - r);
    ctx.lineTo(pos.x + r, pos.y - r);
    ctx.lineTo(pos.x + r, pos.y - r + bracketSize);
    ctx.stroke();

    // Esquina Inferior Izquierda
    ctx.beginPath();
    ctx.moveTo(pos.x - r, pos.y + r - bracketSize);
    ctx.lineTo(pos.x - r, pos.y + r);
    ctx.lineTo(pos.x - r + bracketSize, pos.y + r);
    ctx.stroke();

    // Esquina Inferior Derecha
    ctx.beginPath();
    ctx.moveTo(pos.x + r - bracketSize, pos.y + r);
    ctx.lineTo(pos.x + r, pos.y + r);
    ctx.lineTo(pos.x + r, pos.y + r - bracketSize);
    ctx.stroke();

    ctx.restore();
  }

  public getStats() {
    return {
      totalEntities: this.entities.length,
      time: this.simulationTime.toFixed(2),
      day: this.dayNightSystem.currentDay,
      clock: this.dayNightSystem.getFormattedTime(),
      isNight: this.dayNightSystem.isNight,
    };
  }
}