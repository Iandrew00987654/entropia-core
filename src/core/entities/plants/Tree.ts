import { Vector2D } from '../../math/Vector2D';
import { Plant } from '../Plant';

export class Tree extends Plant {
  public foliageColor: string;
  public trunkColor: string;

  // 1. Caché estática del sprite
  private static sprite: HTMLImageElement | null = null;
  // Tamaño en píxeles del árbol adulto (ej: 36x36 o 48x48 según tu hoja de sprites)
  private readonly maxSpriteSize: number = 40;

  constructor(position: Vector2D) {
    // Radio colisión: 14px | Tasa crecimiento: 0.05/s
    super(position, 14, 0.05);
    this.foliageColor = '#14532d'; // Verde oscuro
    this.trunkColor = '#78350f';   // Marrón madera

    if (!Tree.sprite) {
      Tree.sprite = new Image();
      Tree.sprite.src = '/sprites/tree.png'; // Ajusta al nombre de tu archivo
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (!this.isAlive) return;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // 2. Escala dinámica según 'growth'
    const scale = 0.4 + (this.growth * 0.6); // 40% al nacer -> 100% al madurar
    const currentSize = this.maxSpriteSize * scale;

    // 3. Renderizado con Sprite o Fallback concéntrico
    if (Tree.sprite && Tree.sprite.complete && Tree.sprite.naturalWidth > 0) {
      ctx.drawImage(
        Tree.sprite,
        this.position.x - currentSize / 2,
        this.position.y - currentSize / 2,
        currentSize,
        currentSize
      );
    } else {
      // Fallback: Copa exterior
      ctx.fillStyle = this.foliageColor;
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Fallback: Tronco interior
      ctx.fillStyle = this.trunkColor;
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}