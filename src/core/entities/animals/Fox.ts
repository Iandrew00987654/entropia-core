import { Vector2D } from '../../math/Vector2D';
import { Environment } from '../../world/Environment';
import { Animal } from '../Animal';

export class Fox extends Animal {
  private wanderTimer: number = 0;
  private static sprite: HTMLImageElement | null = null;

  constructor(position: Vector2D) {
    // Radio: 9px | Velocidad: 60px/s | Salud: 80
    super(position, 9, 60, 80);
    // 2. Cargar la imagen
    if (!Fox.sprite) {
      Fox.sprite = new Image();
      Fox.sprite.src = '/sprites/zorro.png'; // Asegúrate de tener esta imagen en la carpeta public
    }
  }

  public update(deltaTime: number, environment: Environment): void {
    if (!this.isAlive) return;

    // 1. Comportamiento: Patrullaje (Wander más largo)
    this.wanderTimer -= deltaTime;
    if (this.wanderTimer <= 0) {
      const angle = Math.random() * Math.PI * 2;
      this.velocity = new Vector2D(Math.cos(angle), Math.sin(angle));
      
      // El zorro camina en línea recta por más tiempo (2 a 5 segundos)
      this.wanderTimer = 2 + Math.random() * 3;
    }

    // 2. Evitar salir del mapa
    this.keepInBounds(environment);

    // 3. Ejecutar movimiento base
    super.update(deltaTime, environment);
  }

  private keepInBounds(environment: Environment): void {
    const nextX = this.position.x + this.velocity.x * this.speed * 0.016;
    const nextY = this.position.y + this.velocity.y * this.speed * 0.016;

    if (nextX <= this.radius || nextX >= environment.width - this.radius) {
      this.velocity = new Vector2D(-this.velocity.x, this.velocity.y);
    }
    if (nextY <= this.radius || nextY >= environment.height - this.radius) {
      this.velocity = new Vector2D(this.velocity.x, -this.velocity.y);
    }
  }

public draw(ctx: CanvasRenderingContext2D): void {
    if (!this.isAlive) return;

    
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Dibujar el sprite si ya cargó
    if (Fox.sprite && Fox.sprite.complete) {
        const spriteSize = 24;

        ctx.drawImage(
            Fox.sprite,
            this.position.x - spriteSize / 2,
            this.position.y - spriteSize / 2,
            spriteSize,
            spriteSize
        );
    } else {
        // Fallback: círculo naranja
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    ctx.restore();
}
}