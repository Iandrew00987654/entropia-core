import { SimulationEngine } from '../engine/SimulationEngine';

interface HUDButton {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  action: (engine: SimulationEngine) => void;
  isActive: (engine: SimulationEngine) => boolean;
}

export class CanvasHUD {
  private buttons: HUDButton[] = [];

  constructor() {
    const startX = 165;
    const topY = 12;
    const bw = 38;
    const bh = 28;

    // Configuración de botones de velocidad y pausa
    this.buttons = [
      {
        id: 'pause',
        label: '⏸',
        x: startX,
        y: topY,
        w: bw,
        h: bh,
        action: (engine) => engine.togglePause(),
        isActive: (engine) => engine.isPaused,
      },
      {
        id: 'speed1',
        label: '1x',
        x: startX + 44,
        y: topY,
        w: bw,
        h: bh,
        action: (engine) => { engine.isPaused = false; engine.timeScale = 1.0; },
        isActive: (engine) => !engine.isPaused && engine.timeScale === 1.0,
      },
      {
        id: 'speed2',
        label: '2x',
        x: startX + 88,
        y: topY,
        w: bw,
        h: bh,
        action: (engine) => { engine.isPaused = false; engine.timeScale = 2.0; },
        isActive: (engine) => !engine.isPaused && engine.timeScale === 2.0,
      },
      {
        id: 'speed5',
        label: '5x',
        x: startX + 132,
        y: topY,
        w: bw,
        h: bh,
        action: (engine) => { engine.isPaused = false; engine.timeScale = 5.0; },
        isActive: (engine) => !engine.isPaused && engine.timeScale === 5.0,
      },
    ];
  }

  public draw(ctx: CanvasRenderingContext2D, engine: SimulationEngine): void {
    ctx.save();
    // Reseteamos cualquier transformación de cámara para dibujar en coordenadas de pantalla fijas
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const hudX = 12;
    const hudY = 8;
    const hudW = 335;
    const hudH = 36;

    // 1. Panel translúcido estilo Glassmorphism
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 8);
    ctx.fill();
    ctx.stroke();

    // 2. Reloj e Indicador de Día
    const daySys = engine.dayNightSystem;
    const icon = daySys.isNight ? '🌙' : '☀️';
    const timeStr = daySys.getFormattedTime();
    const dayStr = `Día ${daySys.currentDay}`;

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${icon} ${dayStr} ${timeStr}`, hudX + 12, hudY + hudH / 2);

    // 3. Renderizado de Botones
    for (const btn of this.buttons) {
      const active = btn.isActive(engine);

      ctx.fillStyle = active ? '#2563eb' : 'rgba(51, 65, 85, 0.6)';
      ctx.strokeStyle = active ? '#60a5fa' : '#475569';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = active ? '#ffffff' : '#cbd5e1';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }

    ctx.restore();
  }

  /**
   * Procesa los clicks del ratón. Si el click impacta la UI, retorna true para cancelar interacciones con el mapa.
   */
  public handleClick(mouseX: number, mouseY: number, engine: SimulationEngine): boolean {
    for (const btn of this.buttons) {
      if (
        mouseX >= btn.x &&
        mouseX <= btn.x + btn.w &&
        mouseY >= btn.y &&
        mouseY <= btn.y + btn.h
      ) {
        btn.action(engine);
        return true; // Click capturado por la UI
      }
    }
    return false;
  }
}