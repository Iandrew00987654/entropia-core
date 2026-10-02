import { Vector2D } from '../../math/Vector2D';
import { Environment } from '../../world/Environment';
import { Animal } from '../Animal';

export class Rabbit extends Animal {
  private wanderTimer: number = 0;
  private static sprite: HTMLImageElement | null = null;

  constructor(position: Vector2D) {
    // Radio: 6px | Velocidad: 45px/s | Salud: 50
    super(position, 6, 45, 50);
    if (!Rabbit.sprite) {
      Rabbit.sprite = new Image();
      Rabbit.sprite.src = '/sprites/conejo.png'; // Ruta relativa a la carpeta public
    }
  }

  public update(deltaTime: number, environment: Environment): void {
    if (!this.isAlive) return;

    // 1. Comportamiento: Caminata aleatoria
    this.wanderTimer -= deltaTime;
    if (this.wanderTimer <= 0) {
      // Elegir un ángulo aleatorio entre 0 y 360 grados (en radianes)
      const angle = Math.random() * Math.PI * 2;
      // Convertir el ángulo a un vector de dirección normalizado
      this.velocity = new Vector2D(Math.cos(angle), Math.sin(angle));
      
      // Cambiar de dirección de nuevo en 1 a 3 segundos
      this.wanderTimer = 1 + Math.random() * 2;
    }

    // 2. Evitar salir del mapa (Rebote simple)
    this.keepInBounds(environment);

    // 3. Ejecutar el movimiento físico de la clase base
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

    if (Rabbit.sprite && Rabbit.sprite.complete) {
        const spriteSize = 16;

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
        ctx.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    ctx.restore();
}
}