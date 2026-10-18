import { Vector2D } from '../../math/Vector2D';
import { Environment } from '../../world/Environment';
import { BiomeType } from '../../world/Biome';
import { Animal } from '../Animal';

export class Rabbit extends Animal {
  private wanderTimer: number = 0;
  private static sprite: HTMLImageElement | null = null;

  constructor(position: Vector2D) {
    // Radio: 6px | Velocidad: 15px/s | Salud: 50 | Biomas: Pradera y Bosque
    super(position, 6, 15, 50, [BiomeType.GRASSLAND, BiomeType.FOREST]);

    if (!Rabbit.sprite) {
      Rabbit.sprite = new Image();
      Rabbit.sprite.src = '/sprites/conejo.png';
    }
  }

  public update(deltaTime: number, environment: Environment): void {
    if (!this.isAlive) return;

    // 1. Lógica de vagar
    this.wanderTimer -= deltaTime;
    if (this.wanderTimer <= 0) {
      const angle = Math.random() * Math.PI * 2;
      this.velocity = new Vector2D(Math.cos(angle), Math.sin(angle));
      this.wanderTimer = 1 + Math.random() * 2;
    }

    // 2. Confinamiento de bioma y mapa
    const collided = this.keepInBoundsAndBiome(environment, deltaTime);
    if (collided) {
      // Si choca con el borde de su bioma, forzar un nuevo rumbo en breve
      this.wanderTimer = 0.5 + Math.random() * 0.5;
    }

    // 3. Movimiento físico base
    super.update(deltaTime, environment);
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (!this.isAlive) return;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (Rabbit.sprite && Rabbit.sprite.complete && Rabbit.sprite.naturalWidth > 0) {
      const spriteSize = 10; // Ajusta según el tamaño del sprite
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

    ctx.restore();
  }
}