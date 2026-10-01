import { Biome } from './Biome';
import { Entity } from '../entities/Entity'; // Asumiendo la clase base de tus entidades

export class Cell {
  private readonly _x: number;
  private readonly _y: number;
  private _biome: Biome;
  private _occupant: Entity | null; // Animal o entidad móvil actual
  private _plant: Entity | null;    // Planta fijada al terreno

  constructor(x: number, y: number, biome: Biome) {
    this._x = x;
    this._y = y;
    this._biome = biome;
    this._occupant = null;
    this._plant = null;
  }

  // --- Getters & Setters Encapsulados ---
  public get x(): number { return this._x; }
  public get y(): number { return this._y; }

  public get biome(): Biome { return this._biome; }
  public set biome(biome: Biome) { this._biome = biome; }

  public get occupant(): Entity | null { return this._occupant; }
  public get plant(): Entity | null { return this._plant; }

  // --- Métodos de Control del Terreno ---

  /**
   * Verifica si la celda puede recibir un animal o entidad móvil.
   */
  public isWalkable(): boolean {
    return this._occupant === null;
  }

  /**
   * Verifica si la celda tiene espacio disponible para una planta.
   */
  public canGrowPlant(): boolean {
    return this._plant === null;
  }

  /**
   * Registra el ingreso de un animal a la celda.
   */
  public setOccupant(entity: Entity | null): boolean {
    if (entity !== null && !this.isWalkable()) {
      return false; // La celda ya está ocupada por otro animal
    }
    this._occupant = entity;
    return true;
  }

  /**
   * Agrega una planta en la celda si el espacio está libre.
   */
  public setPlant(plant: Entity | null): boolean {
    if (plant !== null && !this.canGrowPlant()) {
      return false;
    }
    this._plant = plant;
    return true;
  }

  /**
   * Desocupa la celda removiendo el animal.
   */
  public clearOccupant(): void {
    this._occupant = null;
  }

  /**
   * Elimina la planta de la celda (por consumo o muerte).
   */
  public clearPlant(): void {
    this._plant = null;
  }
}