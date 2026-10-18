import { Vector2D } from '../../math/Vector2D';
import { Plant } from '../Plant';

export class Grass extends Plant {
  public color: string;
  
  // 1. Caché estática del sprite (se carga una sola vez en memoria)
  private static sprite: HTMLImageElement | null = null;
  // Tamaño en píxeles del sprite cuando growth = 1.0 (planta madura)
  private readonly maxSpriteSize: number = 16;

  constructor(position: Vector2D) {
    // Radio colisión: 5px | Tasa crecimiento: 0.15/s
    super(position, 5, 0.15);
    this.color = '#22c55e'; // Verde pasto

    // Carga perezosa del asset (carpeta /public/sprites/)
    if (!Grass.sprite) {
      Grass.sprite = new Image();
      Grass.sprite.src = '/sprites/grass.png'; // Ajusta al nombre de tu archivo
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (!this.isAlive) return;

    ctx.save();
    ctx.imageSmoothingEnabled = false; // Pixel art nítido

    // 2. Cálculo de escala proporcional al crecimiento (20% al nacer -> 100% al madurar)
    const scale = 0.2 + (this.growth * 0.8);
    const currentSize = this.maxSpriteSize * scale;

    // 3. Renderizado: Sprite o Fallback si aún no carga
    if (Grass.sprite && Grass.sprite.complete && Grass.sprite.naturalWidth > 0) {
      ctx.drawImage(
        Grass.sprite,
        this.position.x - currentSize / 2,
        this.position.y - currentSize / 2,
        currentSize,
        currentSize
      );
    } else {
      // Fallback geométrico procedural
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }
}