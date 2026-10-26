import { Vector2D } from '../../math/Vector2D';
import { BiomeType } from '../../world/Biome';
import { Animal } from '../Animal';
import { WanderState } from '../../ai/states/WanderState';
import { EatPlantState } from '../../ai/states/EatPlantState';
import { FleeState } from '../../ai/states/FleeState';
import { RestState } from '../../ai/states/RestState';

export class Rabbit extends Animal {
  public wanderState: WanderState;
  public eatState: EatPlantState;
  public fleeState: FleeState;
  public restState: RestState;

  private static sprite: HTMLImageElement | null = null;

  constructor(position: Vector2D) {
    super(position, 6, 15, 50, [BiomeType.GRASSLAND, BiomeType.FOREST], false, 100);

    // Inicializamos con energía media para ver el ciclo activo de inmediato
    this.energy = 40 + Math.random() * 30;

    this.wanderState = new WanderState();
    this.eatState = new EatPlantState();
    this.fleeState = new FleeState(110);
    this.restState = new RestState();

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

    // 1. Sprite o fallback del conejo
    if (Rabbit.sprite && Rabbit.sprite.complete && Rabbit.sprite.naturalWidth > 0) {
      const spriteSize = 10;
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

    // 2. Feedback visual según el estado activo:

    // A. Comiendo: Barra de progreso verde
    if (this.currentState === this.eatState && this.eatState.eatingTimer > 0) {
      const progress = 1 - (this.eatState.eatingTimer / this.eatState.requiredDuration);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(this.position.x - 7, this.position.y - 12, 14, 3);
      ctx.fillStyle = '#fd0000';
      ctx.fillRect(this.position.x - 7, this.position.y - 12, 14 * progress, 3);
    }

    // B. Descansando: Indicador de sueño (Zzz)
    if (this.currentState === this.restState) {
      ctx.fillStyle = '#38bdf8'; // Azul claro
      ctx.font = 'bold 10px monospace';
      ctx.fillText('zZ', this.position.x + 4, this.position.y - 6);
    }

    // C. Huyendo: Alerta roja
    if (this.currentState === this.fleeState) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('!', this.position.x - 3, this.position.y - 10);
    }

    ctx.restore();
  }
}