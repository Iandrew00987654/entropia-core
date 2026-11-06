<!-- src/components/InspectorPanel.vue -->
<script setup lang="ts">
import type { InspectorTelemetry } from '@/types/telemetry';

defineProps<{
  telemetry: InspectorTelemetry;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <aside class="w-96 border-l border-slate-800 bg-slate-950 flex flex-col h-full overflow-hidden text-sm select-none">
    
    <!-- ENCABEZADO -->
    <header class="p-4 border-b border-slate-800/80 bg-slate-900/40 flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <span class="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <span class="font-bold tracking-wider text-xs uppercase text-slate-300">Terminal Entropía</span>
      </div>
      <button 
        v-if="telemetry.mode !== 'NONE'" 
        @click="emit('close')"
        class="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
      >
        Cerrar ✕
      </button>
    </header>

    <!-- CUERPO CON SCROLL -->
    <div class="flex-1 overflow-y-auto p-4 space-y-5 custom-scroll">

      <!-- ================= 1. NINGUNA ENTIDAD SELECCIONADA ================= -->
      <section v-if="telemetry.mode === 'NONE'" class="space-y-6">
        <div class="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 text-center space-y-2">
          <div class="text-3xl">📡</div>
          <h3 class="font-semibold text-slate-200">Sensor en Espera</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Haz clic sobre cualquier organismo en el mapa para iniciar el rastreo de constantes vitales.
          </p>
        </div>

        <!-- CENSO GLOBAL -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Censo de Población</h4>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span class="text-slate-400 block">Total Entidades</span>
              <span class="text-lg font-mono font-bold text-slate-100">{{ telemetry.global.total }}</span>
            </div>
            <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span class="text-slate-400 block">Vegetación</span>
              <span class="text-lg font-mono font-bold text-emerald-400">{{ telemetry.global.plants }}</span>
            </div>
            <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span class="text-slate-400 block">Herbívoros (🐰)</span>
              <span class="text-lg font-mono font-bold text-slate-200">{{ telemetry.global.rabbits }}</span>
            </div>
            <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span class="text-slate-400 block">Depredadores (🦊)</span>
              <span class="text-lg font-mono font-bold text-amber-500">{{ telemetry.global.foxes }}</span>
            </div>
          </div>
        </div>

        <!-- AMBIENTE -->
        <div class="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Ambiente General</h4>
          <div class="flex justify-between items-center text-xs font-mono">
            <span class="text-slate-400">Cronología:</span>
            <span class="text-slate-200">Día {{ telemetry.global.day }} · {{ telemetry.global.clock }}</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-slate-400">Fase Solar:</span>
            <span :class="telemetry.global.isNight ? 'text-indigo-400 font-semibold' : 'text-amber-300 font-semibold'">
              {{ telemetry.global.isNight ? '🌙 Periodo Nocturno' : '☀️ Periodo Diurno' }}
            </span>
          </div>
        </div>
      </section>

      <!-- ================= 2. ANIMAL SELECCIONADO ================= -->
      <section v-else-if="telemetry.mode === 'ANIMAL'" class="space-y-4">
        <!-- FICHA DE ESPECIE -->
        <div class="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-1.5">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs font-bold uppercase tracking-widest text-cyan-400">Espécimen Animal</span>
              <h2 class="text-lg font-bold text-slate-100">{{ telemetry.entity.species }}</h2>
            </div>
            <span 
              :class="telemetry.entity.isAlive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'"
              class="px-2 py-0.5 rounded text-[11px] font-mono border font-semibold"
            >
              {{ telemetry.entity.isAlive ? 'VIVO' : 'CADÁVER' }}
            </span>
          </div>
          <div class="flex justify-between text-xs text-slate-400 font-mono">
            <span>ID: {{ telemetry.entity.shortId }}</span>
            <span>Edad: {{ telemetry.entity.ageFormatted }}</span>
          </div>
        </div>

        <!-- CONSTANTES VITALES -->
        <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Constantes Vitales</h4>
          
          <!-- Salud -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs">
              <span class="text-slate-300 font-medium">Salud</span>
              <span class="font-mono text-emerald-400">{{ telemetry.entity.health }} / {{ telemetry.entity.maxHealth }} HP</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                class="bg-emerald-500 h-full rounded-full transition-all duration-200" 
                :style="{ width: `${telemetry.entity.healthPct}%` }"
              ></div>
            </div>
          </div>

          <!-- Energía -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs">
              <span class="text-slate-300 font-medium">Energía</span>
              <span class="font-mono text-sky-400">{{ telemetry.entity.energy }} / {{ telemetry.entity.maxEnergy }} EP</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                class="bg-sky-500 h-full rounded-full transition-all duration-200" 
                :style="{ width: `${telemetry.entity.energyPct}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- COMPORTAMIENTO & ESTADOS -->
        <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Comportamiento (FSM)</h4>
          
          <div class="flex items-center space-x-2">
            <span class="text-xs text-slate-400">Estado:</span>
            <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-amber-400 border border-slate-700">
              {{ telemetry.entity.stateName }}
            </span>
          </div>

          <!-- Interacción Contextual -->
          <div class="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-slate-400 font-medium">Actividad:</span>
              <span class="text-slate-200 font-semibold">{{ telemetry.entity.interaction.title }}</span>
            </div>

            <!-- Si está comiendo -->
            <div v-if="telemetry.entity.interaction.type === 'EATING'" class="space-y-1 pt-1">
              <div class="flex justify-between text-[11px] text-slate-400">
                <span>Alimento: {{ telemetry.entity.interaction.targetSpecies }}</span>
                <span class="font-mono text-emerald-400">{{ telemetry.entity.interaction.progressText }}</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  class="bg-emerald-500 h-full rounded-full transition-all duration-150"
                  :style="{ width: `${telemetry.entity.interaction.progress}%` }"
                ></div>
              </div>
            </div>

            <!-- Si está cazando o huyendo -->
            <div 
              v-else-if="telemetry.entity.interaction.type === 'CHASING' || telemetry.entity.interaction.type === 'FLEEING'"
              class="flex justify-between text-[11px] text-slate-400 pt-1"
            >
              <span>Objetivo: {{ telemetry.entity.interaction.targetSpecies }}</span>
              <span class="font-mono text-slate-300">#{{ telemetry.entity.interaction.targetId }}</span>
            </div>
          </div>
        </div>

        <!-- LOCALIZACIÓN Y CINEMÁTICA -->
        <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Cinemática y Hábitat</h4>
          <div class="flex justify-between py-1 border-b border-slate-800/60">
            <span class="text-slate-400">Bioma:</span>
            <span class="font-semibold text-slate-200">{{ telemetry.entity.biomeName }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-800/60">
            <span class="text-slate-400">Posición Mundo:</span>
            <span class="font-mono text-slate-300">X: {{ telemetry.entity.posX }} · Y: {{ telemetry.entity.posY }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-800/60">
            <span class="text-slate-400">Celda Matriz:</span>
            <span class="font-mono text-slate-300">Col {{ telemetry.entity.col }}, Fila {{ telemetry.entity.row }}</span>
          </div>
          <div class="flex justify-between py-1">
            <span class="text-slate-400">Velocidad Fís.:</span>
            <span class="font-mono text-slate-300">{{ telemetry.entity.speed }} px/s</span>
          </div>
        </div>
      </section>

      <!-- ================= 3. PLANTA SELECCIONADA ================= -->
      <section v-else-if="telemetry.mode === 'PLANT'" class="space-y-4">
        <div class="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-1.5">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs font-bold uppercase tracking-widest text-emerald-400">Flora Silvestre</span>
              <h2 class="text-lg font-bold text-slate-100">{{ telemetry.entity.species }}</h2>
            </div>
            <span class="px-2 py-0.5 rounded text-[11px] font-mono border font-semibold bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              PRODUCTOR
            </span>
          </div>
          <div class="flex justify-between text-xs text-slate-400 font-mono">
            <span>ID: {{ telemetry.entity.shortId }}</span>
            <span>Edad: {{ telemetry.entity.ageFormatted }}</span>
          </div>
        </div>

        <!-- MADURACIÓN -->
        <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-slate-300 font-medium">Nivel de Crecimiento</span>
            <span class="font-mono text-emerald-400">{{ telemetry.entity.growthPct }}%</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              class="bg-emerald-500 h-full rounded-full transition-all duration-200" 
              :style="{ width: `${telemetry.entity.growthPct}%` }"
            ></div>
          </div>
        </div>

        <!-- DETALLES DEL TERRENO -->
        <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Fijación al Terreno</h4>
          <div class="flex justify-between py-1 border-b border-slate-800/60">
            <span class="text-slate-400">Bioma Anfitrión:</span>
            <span class="font-semibold text-slate-200">{{ telemetry.entity.biomeName }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-800/60">
            <span class="text-slate-400">Celda:</span>
            <span class="font-mono text-slate-300">Col {{ telemetry.entity.col }}, Fila {{ telemetry.entity.row }}</span>
          </div>
          <div class="flex justify-between py-1">
            <span class="text-slate-400">Radio Físico:</span>
            <span class="font-mono text-slate-300">{{ telemetry.entity.radius }} px (Máx: {{ telemetry.entity.maxRadius }} px)</span>
          </div>
        </div>
      </section>

    </div>
  </aside>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 5px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
</style>