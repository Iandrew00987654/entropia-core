// src/types/telemetry.ts

export interface BaseEntityData {
  id: string;
  shortId: string;
  species: string;
  isAlive: boolean;
  ageFormatted: string;
  biomeName: string;
  posX: string;
  posY: string;
  col: number;
  row: number;
  radius: number;
}

export interface AnimalInteractionData {
  type: 'EATING' | 'CHASING' | 'FLEEING' | 'RESTING' | 'NONE';
  title: string;
  targetSpecies?: string;
  targetId?: string;
  progress?: number;
  progressText?: string;
}

export interface AnimalData extends BaseEntityData {
  kind: 'ANIMAL';
  health: number;
  maxHealth: number;
  healthPct: number;
  energy: number;
  maxEnergy: number;
  energyPct: number;
  speed: number;
  stateName: string;
  interaction: AnimalInteractionData;
}

export interface PlantData extends BaseEntityData {
  kind: 'PLANT';
  growthPct: number;
  maxRadius: number;
}

export interface GlobalTelemetryData {
  total: number;
  rabbits: number;
  foxes: number;
  plants: number;
  day: number;
  clock: string;
  isNight: boolean;
}

// Unión discriminada por el campo 'mode'
export type InspectorTelemetry =
  | { mode: 'NONE'; global: GlobalTelemetryData }
  | { mode: 'ANIMAL'; global: GlobalTelemetryData; entity: AnimalData }
  | { mode: 'PLANT'; global: GlobalTelemetryData; entity: PlantData };