export class Vector2D {
  constructor(public x: number = 0, public y: number = 0) {}

  // Add vectors (to apply velocity to position)
  public add(vector: Vector2D): Vector2D {
    return new Vector2D(this.x + vector.x, this.y + vector.y);
  }

  // Subtract vectors (to calculate direction toward a target or prey)
  public subtract(vector: Vector2D): Vector2D {
    return new Vector2D(this.x - vector.x, this.y - vector.y);
  }

  // Multiply by a scalar (to adjust speed or scale)
  public multiply(number: number): Vector2D {
    return new Vector2D(this.x * number, this.y * number);
  }

  // Euclidean distance between two points
  public distance(vector: Vector2D): number {
    const differenceX = this.x - vector.x;
    const differenceY = this.y - vector.y;

    return Math.sqrt(
      differenceX * differenceX + differenceY * differenceY
    );
  }

  // Clone the current vector
  public clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }
}