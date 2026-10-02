import { Vector2D } from '../../math/Vector2D';
import { Plant } from '../Plant';

export class Grass extends Plant {
  public color: string;

  constructor(position: Vector2D) {
    // Radio máximo: 5px | Tasa: 0.15/segundo
    super(position, 5, 0.15);
    this.color = '#22c55e'; // Verde pasto brillante
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (!this.isAlive) return;

    ctx.save();
    
    // Cuerpo principal de la hierba
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Borde exterior para darle definición sobre el terreno
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}