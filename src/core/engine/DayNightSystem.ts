export class DayNightSystem {
  public readonly cycleDuration: number = 120; // 120 segundos simulados por día completo
  public currentDay: number = 1;
  public timeInCycle: number = 0; // Temporizador continuo (0 a 120s)
  public ambientAlpha: number = 0; // Opacidad del filtro (0.0 = pleno sol, 0.70 = medianoche)
  public isNight: boolean = false;

  // Callback preparado para la regeneración de plantas al amanecer
  public onNewDay?: (day: number) => void;

  public update(deltaTime: number): void {
    this.timeInCycle += deltaTime;

    // Uso de 'while' para proteger contra saltos de frame en velocidades altas (5x)
    while (this.timeInCycle >= this.cycleDuration) {
      this.timeInCycle -= this.cycleDuration;
      this.currentDay++;
      if (this.onNewDay) {
        this.onNewDay(this.currentDay);
      }
    }

    // Progreso normalizado del día: 0.0 (00:00) a 1.0 (24:00)
    const progress = this.timeInCycle / this.cycleDuration;
    const currentHour = progress * 24;

    // Curva astronómica: pico de sombra a las 00:00 (cos = 1) y 0 sombra de 06:00 a 18:00
    const rawDarkness = Math.cos(progress * Math.PI * 2);
    this.ambientAlpha = Math.max(0, rawDarkness * 0.70);

    // Es noche si el reloj marca entre las 18:00 y las 06:00
    this.isNight = currentHour < 6 || currentHour >= 18;
  }

  /**
   * Aplica la capa de oscuridad atmosférica sobre el Canvas.
   */
  public drawNightFilter(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (this.ambientAlpha <= 0.005) return;

    ctx.save();
    // Azul marino medianoche profundo
    ctx.fillStyle = `rgba(6, 12, 34, ${this.ambientAlpha.toFixed(3)})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  /**
   * Formatea la hora a un reloj digital de 24 horas (HH:MM)
   */
  public getFormattedTime(): string {
    const totalMinutes = Math.floor((this.timeInCycle / this.cycleDuration) * 24 * 60);
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = Math.floor(totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}