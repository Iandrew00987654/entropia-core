<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let resizeObserver: ResizeObserver | null = null

// Función dedicada a sincronizar la resolución interna con el tamaño CSS real
const resizeCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  // Sincronizamos la resolución interna (pixeles de dibujo)
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight

}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  // 1. Ajuste inicial de resolución
  resizeCanvas()

  // 2. Escuchar cambios de tamaño en el contenedor padre o en el propio canvas
  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
  })

  // Comenzamos a observar el elemento
  resizeObserver.observe(canvas)
})

onUnmounted(() => {
  // Limpieza para evitar fugas de memoria
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
    <main class="flex-1 relative bg-slate-900 flex items-center justify-center p-4">
      <canvas 
        ref="canvasRef" 
        class="w-full h-full border border-slate-800 rounded-2xl"
      ></canvas>
    </main>

    <aside class="w-96 border-l border-slate-800 bg-slate-950 flex flex-col h-full">
      <!-- Reservado para Controles e Inspector -->
    </aside>
  </div>
</template>