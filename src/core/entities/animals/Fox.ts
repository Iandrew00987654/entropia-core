import { Vector2D } from '../../math/Vector2D';
import { BiomeType } from '../../world/Biome';
import { Animal } from '../Animal';
import { WanderState } from '../../ai/states/WanderState';
import { ChaseState } from '../../ai/states/ChaseState';
import { RestState } from '../../ai/states/RestState';

export class Fox extends Animal {
  public wanderState: WanderState;
  public chaseState: ChaseState;
  public restState: RestState;
  public readonly speciesName: string = 'Zorro';

  private static sprite: HTMLImageElement | null = null;

  constructor(position: Vector2D) {
    // Posición, Radio: 9, Velocidad: 12, Salud: 80, Biomas, isPredator: true, MaxEnergía: 100
    super(position, 9, 12, 80, [BiomeType.FOREST, BiomeType.GRASSLAND], true, 100);

    // Inicializamos con energía variada para que no todos cacen al mismo segundo
    this.energy = 50 + Math.random() * 30;

    this.wanderState = new WanderState();
    this.chaseState = new ChaseState();
    this.restState = new RestState();

    this.changeState(this.wanderState);

    if (!Fox.sprite) {
      Fox.sprite = new Image();
      Fox.sprite.src = '/sprites/zorro.png';
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (!this.isAlive) return;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // 1. Dibujar Sprite o Fallback
    if (Fox.sprite && Fox.sprite.complete && Fox.sprite.naturalWidth > 0) {
      const spriteSize = 20;
      ctx.drawImage(
        Fox.sprite,
        this.position.x - spriteSize / 2,
        this.position.y - spriteSize / 2,
        spriteSize,
        spriteSize
      );
    } else {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 2. Indicadores Visuales de Estado

    // A. Cazando / Persiguiendo: Marcador rojo/amarillo
    if (this.currentState === this.chaseState) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('⚡', this.position.x - 4, this.position.y - 12);
    }

    // B. Descansando por agotamiento
    if (this.currentState === this.restState) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('zZ', this.position.x + 6, this.position.y - 8);
    }

    ctx.restore();
  }
}