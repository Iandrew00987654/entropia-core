import { Vector2D } from '../math/Vector2D';

export class Environment {
  // Dimensiones del mundo virtual en píxeles
  public dimensions: Vector2D;

  // Transformaciones de la cámara
  public offset: Vector2D;
  public zoom: number;

  // Configuración visual de la cuadrícula
  private cellSize: number;

  constructor(dimensions: Vector2D = new Vector2D(3000, 3000)) {
    this.dimensions = dimensions;
    this.offset = new Vector2D(0, 0);
    this.zoom = 1.0;
    this.cellSize = 50; // Cada celda mide 50x50px
  }

  /**
   * Renderiza el estado actual del mundo en el canvas.
   * @param ctx Contexto de renderizado 2D.
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 1. Limpiar el lienzo
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 2. Aplicar las transformaciones de la cámara (Zoom y Pan)
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.zoom, this.zoom);

    // 3. Dibujar el fondo del mundo (Límites)
    ctx.fillStyle = '#020617'; // slate-950
    ctx.fillRect(0, 0, this.dimensions.x, this.dimensions.y);

    // 4. Dibujar la cuadrícula interna
    this.drawGrid(ctx);

    // 5. Dibujar el borde del mapa
    ctx.strokeStyle = '#334155'; // slate-700
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, this.dimensions.x, this.dimensions.y);

    ctx.restore();
  }

  /**
   * Dibuja las líneas horizontales y verticales dentro de las dimensiones del mundo.
   */
  private drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.lineWidth = 1;

    ctx.beginPath();

    // Líneas verticales
    for (let x = 0; x <= this.dimensions.x; x += this.cellSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.dimensions.y);
    }

    // Líneas horizontales
    for (let y = 0; y <= this.dimensions.y; y += this.cellSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.dimensions.x, y);
    }

    ctx.stroke();
  }
}