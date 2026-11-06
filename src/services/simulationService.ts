// src/services/simulationService.ts

const API_BASE_URL = 'http://localhost:3000/api/simulations';

export interface SavedSimulationSummary {
  id: number;
  name: string;
  simulation_time: number;
  current_day: number;
  clock: string;
  is_night: boolean;
  total_entities: number;
  created_at: string;
}

export class SimulationService {
  public static async getAll(): Promise<SavedSimulationSummary[]> {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error('Error al listar simulaciones');
    return await res.json();
  }

  public static async getById(id: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) throw new Error('Error al cargar la simulación');
    return await res.json();
  }

  public static async save(payload: any): Promise<{ simulationId: number }> {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al guardar la partida');
    return await res.json();
  }

  public static async delete(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar la simulación');
  }
}