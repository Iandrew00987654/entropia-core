import { Vector2D } from '../math/Vector2D';
import { Cell } from './Cell';
import { STATIC_MAP } from './staticmap/staticMap.ts';
import { BIOME_DATA } from './BiomeData';

export class Environment {
  public dimensions: Vector2D;
  public offset: Vector2D;
  public zoom: number;

  private readonly cellSize: number;
  public readonly cols: number;
  public readonly rows: number;

  private grid: Cell[][] = []; 

  // Inyección de dependencias: Recibe el mapa, no lo hardcodea
  constructor(
    dimensions: Vector2D = new Vector2D(3000, 3000), 
    mapBlueprint: string[] = STATIC_MAP
  ) {
    this.dimensions = dimensions;
    this.offset = new Vector2D(0, 0);
    this.zoom = 1.0;
    this.cellSize = 50;

    this.cols = Math.ceil(this.dimensions.x / this.cellSize);
    this.rows = Math.ceil(this.dimensions.y / this.cellSize);

    this.generateWorld(mapBlueprint);
  }

  private generateWorld(map: string[]): void {
    for (let r = 0; r < this.rows; r++) {
      const row: Cell[] = [];
      
      for (let c = 0; c < this.cols; c++) {
        // Mantenemos el módulo (%) por seguridad, por si el blueprint 
        // es más pequeño que las dimensiones del canvas
        const mapRow = map[r % map.length];
        const symbol = mapRow![c % mapRow!.length];
        
        // Búsqueda en O(1) usando el diccionario. Fallback a Grassland si hay un error tipográfico.
        const biome = BIOME_DATA[symbol!] || BIOME_DATA['G'];

        row.push(new Cell(c, r, biome!));
      }
      
      this.grid.push(row);
    }
  }
  // 1. Obtiene la celda pasando fila y columna directamente
  public getCell(col: number, row: number): Cell | null {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return null;
    }
    return this.grid[row]?.[col] ?? null;
  }

    // 2. Traduce una posición en píxeles (Vector2D) a la celda exacta sobre la que está
  public getCellFromWorldPos(position: Vector2D): Cell | null {
    const col = Math.floor(position.x / this.cellSize);
    const row = Math.floor(position.y / this.cellSize);
    return this.getCell(col, row);
  }
  
  public getCellCenterWorldPos(col: number, row: number): Vector2D {
  return new Vector2D(
    col * this.cellSize + this.cellSize / 2,
    row * this.cellSize + this.cellSize / 2
  );
  }
  public get width(): number {
    return this.cols * this.cellSize; // ej: 60 * 50 = 3000
  }

  /**
   * Alto total del mundo en píxeles
   */
  public get height(): number {
    return this.rows * this.cellSize; // ej: 60 * 50 = 3000
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.zoom, this.zoom);

    this.drawBiomes(ctx);
    this.drawGrid(ctx);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, this.dimensions.x, this.dimensions.y);
    ctx.restore();
  }

  private drawBiomes(ctx: CanvasRenderingContext2D): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r]![c];
        ctx.fillStyle = cell!.biome.color; 
        ctx.fillRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
      }
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)'; 
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x <= this.dimensions.x; x += this.cellSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.dimensions.y);
    }
    for (let y = 0; y <= this.dimensions.y; y += this.cellSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.dimensions.x, y);
    }
    ctx.stroke();
  }
}