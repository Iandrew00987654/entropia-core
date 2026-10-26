import { Vector2D } from '../../math/Vector2D';
import { Environment } from '../../world/Environment';
import { BiomeType } from '../../world/Biome';
import { Animal } from '../Animal';
import { Entity } from '../Entity';

export class Fox extends Animal {
  private wanderTimer: number = 0;
  private static sprite: HTMLImageElement | null = null;

  constructor(position: Vector2D) {
    // Radio: 9px | Velocidad: 12px/s | Salud: 80 | Biomas: Bosque y Pradera
    super(position, 9, 12, 80, [BiomeType.FOREST, BiomeType.GRASSLAND],true, 100);

    if (!Fox.sprite) {
      Fox.sprite = new Image();
      Fox.sprite.src = '/sprites/zorro.png';
    }
  }

  public update(deltaTime: number, environment: Environment, entities: Entity[]): void {
    if (!this.isAlive) return;

    // 1. Patrullaje
    this.wanderTimer -= deltaTime;
    if (this.wanderTimer <= 0) {
      const angle = Math.random() * Math.PI * 2;
      this.velocity = new Vector2D(Math.cos(angle), Math.sin(angle));
      this.wanderTimer = 2 + Math.random() * 3;
    }

    // 2. Límites
    const collided = this.keepInBoundsAndBiome(environment, deltaTime);
    if (collided) {
      this.wanderTimer = 1 + Math.random();
  }

    // 3. Físicas base
    super.update(deltaTime, environment, entities);
  }


  public draw(ctx: CanvasRenderingContext2D): void {
    if (!this.isAlive) return;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (Fox.sprite && Fox.sprite.complete && Fox.sprite.naturalWidth > 0) {
      const spriteSize = 20; // Ajusta según el tamaño del sprite
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

    ctx.restore();
  }
}