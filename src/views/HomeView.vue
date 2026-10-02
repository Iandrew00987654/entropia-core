<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Vector2D } from '@/core/math/Vector2D';
import { Environment } from '@/core/world/Environment';
import { SimulationEngine } from '@/core/engine/SimulationEngine';
import { AgentFactory } from '@/core/entities/AgentFactory';

const canvasRef = ref<HTMLCanvasElement | null>(null);

let environment: Environment;
let engine: SimulationEngine;
let animFrameId: number;
let resizeObserver: ResizeObserver | null = null;

// Control de tiempo para el loop
let lastTime = 0;

// Estados para el pan (arrastre)
let isDragging = false;
let lastMousePosition = new Vector2D(0, 0);

const resizeCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
};

/**
 * Bucle de animación independiente.
 * 'timestamp' es provisto automáticamente por requestAnimationFrame (en milisegundos).
 */
const gameLoop = (timestamp: number, ctx: CanvasRenderingContext2D) => {
  if (!lastTime) lastTime = timestamp;

  // Calculamos el deltaTime seguro en segundos (con un tope máximo de 0.1s para evitar saltos si se cambia de pestaña)
  const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  // 1. El motor actualiza la simulación
  engine.update(deltaTime);

  // 2. El motor dibuja el mundo y sus entidades
  engine.draw(ctx);

  // Enlazamos el siguiente frame
  animFrameId = requestAnimationFrame((nextTimestamp) => gameLoop(nextTimestamp, ctx));
};

// --- EVENTOS DE ENTRADA ---

const handleMouseDown = (e: MouseEvent) => {
  isDragging = true;
  lastMousePosition = new Vector2D(e.clientX, e.clientY);
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging) return;
  const currentPosition = new Vector2D(e.clientX, e.clientY);
  const delta = currentPosition.subtract(lastMousePosition);

  environment.offset = environment.offset.add(delta);
  lastMousePosition = currentPosition;
};

const handleMouseUp = () => {
  isDragging = false;
};

const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  const minZoom = 0.2;
  const maxZoom = 5.0;

  const newZoom = Math.min(Math.max(environment.zoom * zoomFactor, minZoom), maxZoom);
  const zoomRatio = newZoom / environment.zoom;
  const mousePos = new Vector2D(e.clientX, e.clientY);

  environment.offset = new Vector2D(
    mousePos.x - (mousePos.x - environment.offset.x) * zoomRatio,
    mousePos.y - (mousePos.y - environment.offset.y) * zoomRatio
  );

  environment.zoom = newZoom;
};

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  resizeCanvas();

  resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
  });
  resizeObserver.observe(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Instanciamos el entorno y el motor
  environment = new Environment(new Vector2D(3000, 3000));
  engine = new SimulationEngine(environment);

  const initialEntities = AgentFactory.createInitialPopulation(environment);
  for (const entity of initialEntities) {
    engine.addEntity(entity);
  }

  // Arrancamos el bucle pasando el timestamp inicial
  animFrameId = requestAnimationFrame((timestamp) => gameLoop(timestamp, ctx));
});

onUnmounted(() => {
  cancelAnimationFrame(animFrameId);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
    <main class="flex-1 relative bg-slate-900 flex items-center justify-center p-4">
      <canvas 
        ref="canvasRef" 
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel="handleWheel"
      class="w-full h-full border border-slate-800 rounded-2xl block cursor-grab active:cursor-grabbing"
      ></canvas>
    </main>

    <aside class="w-96 border-l border-slate-800 bg-slate-950 flex flex-col h-full">
      <!-- Reservado para Controles e Inspector -->
    </aside>
  </div>
</template>