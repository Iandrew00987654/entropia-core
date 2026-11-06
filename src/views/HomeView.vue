<!-- En HomeView.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Vector2D } from '@/core/math/Vector2D';
import { Environment } from '@/core/world/Environment';
import { SimulationEngine } from '@/core/engine/SimulationEngine';
import { AgentFactory } from '@/core/entities/AgentFactory';
import { Animal } from '@/core/entities/Animal';
import { Plant } from '@/core/entities/Plant';
import { Rabbit } from '@/core/entities/animals/Rabbit';
import { Fox } from '@/core/entities/animals/Fox';
import InspectorPanel from '@/components/InspectorPanel.vue';
import SaveLoadModal from '@/components/SaveLoadModal.vue';
import { SimulationService } from '@/services/simulationService';
import type { InspectorTelemetry, AnimalInteractionData } from '@/types/telemetry';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const isSaveModalOpen = ref(false);

let environment: Environment;
let engine: SimulationEngine;
let animFrameId: number;
let resizeObserver: ResizeObserver | null = null;
let telemetryIntervalId: number;
let lastTime = 0;

let isDragging = false;
let dragStartPos = new Vector2D(0, 0);
let lastMousePos = new Vector2D(0, 0);
let hasMoved = false;

const telemetry = ref<InspectorTelemetry>({
  mode: 'NONE',
  global: { total: 0, rabbits: 0, foxes: 0, plants: 0, day: 1, clock: '00:00', isNight: false }
});

const resizeCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
};

const gameLoop = (timestamp: number, ctx: CanvasRenderingContext2D) => {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  engine.update(deltaTime);
  engine.draw(ctx);

  animFrameId = requestAnimationFrame((nextTimestamp) => gameLoop(nextTimestamp, ctx));
};

// --- HANDLERS DE BASE DE DATOS (MARIADB) ---

const handleSaveSimulation = async (name: string) => {
  if (!engine) return;
  try {
    const payload = engine.serialize(name);
    await SimulationService.save(payload);
  } catch (error) {
    console.error('Error al guardar simulación:', error);
  }
};

const handleLoadSimulation = async (id: number) => {
  if (!engine) return;
  try {
    const data = await SimulationService.getById(id);
    engine.loadSnapshot(data);
  } catch (error) {
    console.error('Error al cargar simulación:', error);
  }
};

// Sincronización de Telemetría a 10 Hz
const updateTelemetryDTO = () => {
  if (!engine) return;

  const entities = engine.entities;
  let rabbitCount = 0;
  let foxCount = 0;
  let plantCount = 0;

  for (const e of entities) {
    if (e instanceof Rabbit) rabbitCount++;
    else if (e instanceof Fox) foxCount++;
    else if (e instanceof Plant) plantCount++;
  }

  const globalData = {
    total: entities.length,
    rabbits: rabbitCount,
    foxes: foxCount,
    plants: plantCount,
    day: engine.dayNightSystem.currentDay,
    clock: engine.dayNightSystem.getFormattedTime(),
    isNight: engine.dayNightSystem.isNight
  };

  const sel = engine.selectedEntity;

  if (!sel) {
    telemetry.value = { mode: 'NONE', global: globalData };
    return;
  }

  const cell = environment.getCellFromWorldPos(sel.position);
  const biomeName = cell?.biome.name ?? 'Desconocido';
  const ageSec = Math.floor(sel.age);
  const ageFormatted = `${Math.floor(ageSec / 60)}m ${ageSec % 60}s`;

  if (sel instanceof Animal) {
    let interactionData: AnimalInteractionData = { type: 'NONE', title: 'Ninguna' };
    const stName = sel.currentState?.name ?? 'WANDERING';

    if (stName === 'EATING' && (sel as any).eatState) {
      const eat = (sel as any).eatState;
      const progress = 1 - Math.max(0, eat.eatingTimer / eat.requiredDuration);
      interactionData = {
        type: 'EATING',
        title: 'Consumiendo Vegetación',
        targetSpecies: eat.targetPlant?.speciesName ?? 'Hierba',
        targetId: eat.targetPlant?.id.substring(0, 5),
        progress: progress * 100,
        progressText: `${(eat.requiredDuration - eat.eatingTimer).toFixed(1)}s / ${eat.requiredDuration}s`
      };
    } else if (stName === 'CHASING' && (sel as any).chaseState) {
      const chase = (sel as any).chaseState;
      interactionData = {
        type: 'CHASING',
        title: 'Persiguiendo Presa',
        targetSpecies: chase.targetPrey?.speciesName ?? 'Presa',
        targetId: chase.targetPrey?.id.substring(0, 5)
      };
    } else if (stName === 'FLEEING' && (sel as any).fleeState) {
      const flee = (sel as any).fleeState;
      interactionData = {
        type: 'FLEEING',
        title: 'Evadiendo Amenaza',
        targetSpecies: flee.currentThreat?.speciesName ?? 'Depredador',
        targetId: flee.currentThreat?.id.substring(0, 5)
      };
    } else if (stName === 'RESTING') {
      interactionData = {
        type: 'RESTING',
        title: 'Recuperando Energía'
      };
    }

    telemetry.value = {
      mode: 'ANIMAL',
      global: globalData,
      entity: {
        kind: 'ANIMAL',
        id: sel.id,
        shortId: sel.id.substring(0, 6).toUpperCase(),
        species: sel.speciesName,
        isAlive: sel.isAlive,
        ageFormatted,
        biomeName,
        posX: sel.position.x.toFixed(1),
        posY: sel.position.y.toFixed(1),
        col: cell?.x ?? 0,
        row: cell?.y ?? 0,
        radius: sel.radius,
        health: Math.round(sel.health),
        maxHealth: sel.maxHealth,
        healthPct: Math.round((sel.health / sel.maxHealth) * 100),
        energy: Math.round(sel.energy),
        maxEnergy: sel.maxEnergy,
        energyPct: Math.round((sel.energy / sel.maxEnergy) * 100),
        speed: Math.round(sel.speed),
        stateName: stName,
        interaction: interactionData
      }
    };
  } else if (sel instanceof Plant) {
    telemetry.value = {
      mode: 'PLANT',
      global: globalData,
      entity: {
        kind: 'PLANT',
        id: sel.id,
        shortId: sel.id.substring(0, 6).toUpperCase(),
        species: sel.speciesName,
        isAlive: sel.isAlive,
        ageFormatted,
        biomeName,
        posX: sel.position.x.toFixed(1),
        posY: sel.position.y.toFixed(1),
        col: cell?.x ?? 0,
        row: cell?.y ?? 0,
        radius: Math.round(sel.radius),
        growthPct: Math.round(sel.growth * 100),
        maxRadius: sel.maxRadius
      }
    };
  }
};

// Eventos de ratón
const handleMouseDown = (e: MouseEvent) => {
  const canvas = canvasRef.value;
  if (!canvas || !engine) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (engine.canvasHUD.handleClick(mouseX, mouseY, engine)) {
    isDragging = false;
    return;
  }

  isDragging = true;
  hasMoved = false;
  dragStartPos = new Vector2D(e.clientX, e.clientY);
  lastMousePos = new Vector2D(e.clientX, e.clientY);
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging) return;

  const currentPos = new Vector2D(e.clientX, e.clientY);
  if (currentPos.distance(dragStartPos) > 4) {
    hasMoved = true;
  }

  const delta = currentPos.subtract(lastMousePos);
  environment.offset = environment.offset.add(delta);
  lastMousePos = currentPos;
};

const handleMouseUp = (e: MouseEvent) => {
  const canvas = canvasRef.value;
  if (!canvas || !engine) {
    isDragging = false;
    return;
  }

  if (!hasMoved) {
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const worldX = (screenX - environment.offset.x) / environment.zoom;
    const worldY = (screenY - environment.offset.y) / environment.zoom;

    engine.selectEntityAt(new Vector2D(worldX, worldY));
    updateTelemetryDTO();
  }

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

const deselectEntity = () => {
  if (engine) {
    engine.selectedEntity = null;
    updateTelemetryDTO();
  }
};

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  resizeCanvas();

  resizeObserver = new ResizeObserver(() => resizeCanvas());
  resizeObserver.observe(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  environment = new Environment(new Vector2D(3000, 3000));
  engine = new SimulationEngine(environment);

  const initialEntities = AgentFactory.createInitialPopulation(environment);
  for (const entity of initialEntities) {
    engine.addEntity(entity);
  }

  animFrameId = requestAnimationFrame((timestamp) => gameLoop(timestamp, ctx));
  telemetryIntervalId = window.setInterval(updateTelemetryDTO, 100);
});

onUnmounted(() => {
  cancelAnimationFrame(animFrameId);
  if (telemetryIntervalId) clearInterval(telemetryIntervalId);
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
    
    <!-- CANVAS PRINCIPAL CON BOTÓN FLOTANTE DE PERSISTENCIA -->
    <main class="flex-1 relative bg-slate-900 flex items-center justify-center p-3">
      
      <!-- BOTÓN SUPERIOR DERECHO: ABRIR MODAL BASE DE DATOS -->
      <button 
        @click="isSaveModalOpen = true"
        class="absolute top-6 right-6 z-10 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 shadow-xl flex items-center space-x-2 backdrop-blur-md transition"
      >
        <span>💾</span>
        <span>Gestionar Partidas</span>
      </button>

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

    <!-- PANEL INSPECTOR LATERAL -->
    <InspectorPanel 
      :telemetry="telemetry" 
      @close="deselectEntity" 
    />

    <!-- MODAL CRUD DE MARIADB -->
    <SaveLoadModal 
      :is-open="isSaveModalOpen" 
      @close="isSaveModalOpen = false"
      @save="handleSaveSimulation"
      @load="handleLoadSimulation"
    />
  </div>
</template>