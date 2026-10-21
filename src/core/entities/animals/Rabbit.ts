import { Vector2D } from '../../math/Vector2D';
import { BiomeType } from '../../world/Biome';
import { Animal } from '../Animal';
import { WanderState } from '../../ai/states/WanderState';
import { EatPlantState } from '../../ai/states/EatPlantState';
import { FleeState } from '../../ai/states/FleeState';

export class Rabbit extends Animal {
  // Instancias de estados para esta especie
  public wanderState: WanderState;
  public eatState: EatPlantState;
  public fleeState: FleeState;

  private static sprite: HTMLImageElement | null = null;

  constructor(position: Vector2D) {
    // Parámetros: Posición, Radio (6), Velocidad (15), Salud (50), Biomas permitidos, isPredator (false), MaxEnergía (100)
    super(position, 6, 15, 50, [BiomeType.GRASSLAND, BiomeType.FOREST], false, 100);

    // Inicialización de la máquina de estados
    this.wanderState = new WanderState();
    this.eatState = new EatPlantState();
    this.fleeState = new FleeState(100);

    this.changeState(this.wanderState);

    if (!Rabbit.sprite) {
      Rabbit.sprite = new Image();
      Rabbit.sprite.src = '/sprites/conejo.png';
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (!this.isAlive) return;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // 1. Dibujar Sprite o Fallback
    if (Rabbit.sprite && Rabbit.sprite.complete && Rabbit.sprite.naturalWidth > 0) {
      const spriteSize = 10; // Tamaño del sprite en píxeles
      ctx.drawImage(
        Rabbit.sprite,
        this.position.x - spriteSize / 2,
        this.position.y - spriteSize / 2,
        spriteSize,
        spriteSize
      );
    } else {
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Barra de progreso visual si está comiendo
    if (this.currentState === this.eatState && this.eatState.eatingTimer > 0) {
      const progress = 1 - (this.eatState.eatingTimer / this.eatState.requiredDuration);
      const barWidth = 14;
      const barHeight = 2.5;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(this.position.x - barWidth / 2, this.position.y - 12, barWidth, barHeight);

      ctx.fillStyle = '#c70808'; // rojo progreso
      ctx.fillRect(this.position.x - barWidth / 2, this.position.y - 12, barWidth * progress, barHeight);
    }

    ctx.restore();
  }
}