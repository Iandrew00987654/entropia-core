export class DayNightSystem {
  public readonly cycleDuration: number = 120; // 120 segundos por día simulado
  public currentDay: number = 1;
  public timeInCycle: number = 0; // Temporizador interno (0 a 120s)
  public ambientAlpha: number = 0; // Opacidad de la sombra (0.0 = pleno día, 0.65 = medianoche)
  public isNight: boolean = false;

  // Callback preparado para el Punto 6 (Regeneración de vegetación al amanecer)
  public onNewDay?: (day: number) => void;

  public update(deltaTime: number): void {
    this.timeInCycle += deltaTime;

    // Transición al siguiente día
    if (this.timeInCycle >= this.cycleDuration) {
      this.timeInCycle -= this.cycleDuration;
      this.currentDay++;
      if (this.onNewDay) {
        this.onNewDay(this.currentDay);
      }
    }

    // Progreso del día normalizado (0.0 a 1.0)
    const progress = this.timeInCycle / this.cycleDuration;

    // Onda sinusoidal de luz (Sol en alto a progress = 0.25, Noche cerrada a progress = 0.75)
    const normalizedLight = Math.sin((progress - 0.25) * Math.PI * 2);
    
    // Convertimos el rango (-1 a 1) en opacidad de oscuridad (0.0 a 0.68)
    this.ambientAlpha = Math.max(0, normalizedLight * 0.68);
    this.isNight = this.ambientAlpha > 0.35;
  }

  /**
   * Aplica la capa de oscuridad sobre todo el mundo 2D.
   */
  public drawNightFilter(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (this.ambientAlpha <= 0.01) return;

    ctx.save();
    // Azul marino/púrpura de medianoche
    ctx.fillStyle = `rgba(6, 12, 34, ${this.ambientAlpha.toFixed(3)})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  /**
   * Formatea la hora simulada a un reloj digital (ej: 14:30)
   */
  public getFormattedTime(): string {
    const totalMinutes = Math.floor((this.timeInCycle / this.cycleDuration) * 24 * 60);
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = Math.floor(totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}