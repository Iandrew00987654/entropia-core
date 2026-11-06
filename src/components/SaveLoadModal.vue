<!-- src/components/SaveLoadModal.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SimulationService, type SavedSimulationSummary } from '@/services/simulationService';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', name: string): void;
  (e: 'load', id: number): void;
}>();

const activeTab = ref<'LOAD' | 'SAVE'>('LOAD');
const saveName = ref('');
const savedList = ref<SavedSimulationSummary[]>([]);
const isLoading = ref(false);
const statusMessage = ref('');

const fetchSaves = async () => {
  isLoading.value = true;
  try {
    savedList.value = await SimulationService.getAll();
  } catch (err) {
    statusMessage.value = '❌ Error conectando con el servidor MariaDB';
  } finally {
    isLoading.value = false;
  }
};

const handleSave = () => {
  if (!saveName.value.trim()) return;
  emit('save', saveName.value.trim());
  saveName.value = '';
  statusMessage.value = '✅ Simulación guardada exitosamente';
  setTimeout(() => {
    fetchSaves();
    activeTab.value = 'LOAD';
  }, 800);
};

const handleDelete = async (id: number) => {
  if (!confirm('¿Seguro que deseas eliminar esta simulación de MariaDB?')) return;
  try {
    await SimulationService.delete(id);
    await fetchSaves();
  } catch (err) {
    statusMessage.value = '❌ Error al eliminar';
  }
};

onMounted(() => {
  if (props.isOpen) fetchSaves();
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
      
      <!-- HEADER -->
      <header class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
        <div class="flex items-center space-x-2">
          <span class="text-lg">💾</span>
          <h2 class="font-bold text-sm tracking-wide uppercase text-slate-200">Terminal de Persistencia (MariaDB)</h2>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-white px-2 py-1 rounded">✕</button>
      </header>

      <!-- TABS -->
      <nav class="flex border-b border-slate-800 text-xs font-semibold">
        <button 
          @click="activeTab = 'LOAD'; fetchSaves();" 
          :class="activeTab === 'LOAD' ? 'border-b-2 border-cyan-500 text-cyan-400 bg-slate-800/50' : 'text-slate-400 hover:bg-slate-800/30'"
          class="flex-1 py-3 text-center transition"
        >
          📂 Partidas Guardadas
        </button>
        <button 
          @click="activeTab = 'SAVE'" 
          :class="activeTab === 'SAVE' ? 'border-b-2 border-cyan-500 text-cyan-400 bg-slate-800/50' : 'text-slate-400 hover:bg-slate-800/30'"
          class="flex-1 py-3 text-center transition"
        >
          💾 Guardar Partida Actual
        </button>
      </nav>

      <!-- BODY -->
      <div class="p-5 max-h-[380px] overflow-y-auto space-y-4">
        
        <!-- PESTAÑA: GUARDAR -->
        <section v-if="activeTab === 'SAVE'" class="space-y-4">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase text-slate-400">Nombre de la Reserva / Experimento</label>
            <input 
              v-model="saveName"
              placeholder="Ej: Ecosistema Día 14 - Estable"
              class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              @keyup.enter="handleSave"
            />
          </div>
          <button 
            @click="handleSave" 
            :disabled="!saveName.trim()"
            class="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs tracking-wider uppercase transition shadow-lg shadow-cyan-950"
          >
            Confirmar y Guardar en Base de Datos
          </button>
        </section>

        <!-- PESTAÑA: CARGAR -->
        <section v-else class="space-y-2.5">
          <div v-if="isLoading" class="text-center py-8 text-xs text-slate-400 animate-pulse">
            Consultando registros en MariaDB...
          </div>

          <div v-else-if="savedList.length === 0" class="text-center py-8 text-xs text-slate-500">
            No hay simulaciones registradas en la base de datos.
          </div>

          <div 
            v-for="item in savedList" 
            :key="item.id"
            class="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition"
          >
            <div class="space-y-1">
              <h4 class="font-bold text-sm text-slate-200">{{ item.name }}</h4>
              <p class="text-[11px] font-mono text-slate-400">
                Día {{ item.current_day }} ({{ item.clock }}) · {{ item.total_entities }} organismos vivos
              </p>
            </div>
            
            <div class="flex items-center space-x-2">
              <button 
                @click="emit('load', item.id); emit('close');"
                class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Cargar
              </button>
              <button 
                @click="handleDelete(item.id)"
                class="px-2 py-1.5 bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 text-xs rounded-lg transition"
              >
                🗑
              </button>
            </div>
          </div>
        </section>

        <!-- MENSAJE DE ESTADO -->
        <p v-if="statusMessage" class="text-center text-xs font-mono text-cyan-400 pt-2">
          {{ statusMessage }}
        </p>
      </div>

    </div>
  </div>
</template>