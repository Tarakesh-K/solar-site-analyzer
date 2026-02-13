<script setup lang="ts">
import { ref } from 'vue'
import WeightInput from '@/components/analyze/WeightInput.vue'
import { useSiteStore } from '@/stores/siteStore'
import { Settings2, RefreshCcw, CheckCircle2 } from 'lucide-vue-next'
import type { Weights } from '@/types/analyze'
import { ANALYSIS_WEIGHTS_CONFIG } from '@/constants/analyzeConstants'

const siteStore = useSiteStore()

const form = ref<Weights>({
  solar: 0,
  area: 0,
  grid: 0,
  slope: 0,
  infra: 0,
})

const isProcessing = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const handleRecalculate = async () => {
  isProcessing.value = true

  const payload = {
    weights: { ...form.value },
  }

  try {
    const res = await siteStore.recalculateWeights(payload)
    if (res) {
      toastMessage.value = res.data?.message || 'Calculation Successful'
      showToast.value = true
      // Auto-hide after 3 seconds
      setTimeout(() => {
        showToast.value = false
      }, 3000)
    }
  } catch (error) {
    toastMessage.value = 'Error updating weights'
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)
    console.error('Error while changing weights', error)
  } finally {
    isProcessing.value = false
  }
}

const handleReset = () => {
  try {
    form.value = {
      solar: 0,
      area: 0,
      grid: 0,
      slope: 0,
      infra: 0,
    }
  } catch (error) {
    console.error('Error While resetting state', error)
  }
}
</script>

<template>
  <div
    class="relative min-h-screen bg-black text-white p-6 flex justify-center items-start overflow-hidden"
  >
    <Transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="-translate-y-4 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showToast"
        class="fixed top-[15%] left-1/2 -translate-x-1/2 z-[9999] w-auto whitespace-nowrap"
      >
        <div
          class="bg-zinc-900 border border-blue-500/50 text-blue-400 px-6 py-3 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center gap-3"
        >
          <CheckCircle2 :size="18" />
          <span class="text-sm font-medium tracking-wide">{{ toastMessage }}</span>
        </div>
      </div>
    </Transition>

    <div
      class="w-full relative max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl p-8 shadow-2xl mt-12"
    >
      <div class="w-max absolute top-0 right-0 m-4">
        <button
          @click="handleReset"
          :disabled="isProcessing"
          class="flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-xl transition-all text-xs"
        >
          <RefreshCcw :class="{ 'animate-spin': isProcessing }" :size="14" />
          RESET
        </button>
      </div>
      <div class="flex items-center gap-3 mb-8">
        <div class="p-2 bg-blue-500/10 rounded-lg">
          <Settings2 class="text-blue-500" :size="20" />
        </div>
        <h2 class="text-lg font-semibold tracking-tight">Analysis Parameters</h2>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <WeightInput
          v-for="config in ANALYSIS_WEIGHTS_CONFIG"
          :key="config.id"
          :label="config.label"
          :icon="config.icon"
          :width="config.width"
          v-model="form[config.id]"
        />

        <button
          @click="handleRecalculate"
          :disabled="isProcessing"
          class="col-span-2 mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <RefreshCcw :class="{ 'animate-spin': isProcessing }" :size="18" />
          {{ isProcessing ? 'RECALCULATING...' : 'APPLY WEIGHTS' }}
        </button>
      </div>

      <div class="mt-6 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
        <p class="text-[11px] text-zinc-500 text-center leading-relaxed">
          The sum of all weights should equal <span class="text-zinc-300 font-mono">1.0</span> for
          accurate scoring.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optional: slightly blur the background when toast is active */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}
</style>
