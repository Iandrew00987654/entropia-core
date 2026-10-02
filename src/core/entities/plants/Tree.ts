import { Vector2D } from '../../math/Vector2D';
import { Plant } from '../Plant';

export class Tree extends Plant {
  public foliageColor: string;
  public trunkColor: string;

  constructor(position: Vector2D) {
    // Radio máximo: 14px | Tasa: 0.05/segundo
    super(position, 14, 0.05);
    this.foliageColor = '#14532d'; // Verde bosque oscuro
    this.trunkColor = '#78350f';   // Marrón madera
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (!this.isAlive) return;

    ctx.save();

    // 1. Dibujar Copa / Follaje (Círculo exterior)
    ctx.fillStyle = this.foliageColor;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. Dibujar Centro / Tronco (Círculo interior proporcional)
    ctx.fillStyle = this.trunkColor;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}