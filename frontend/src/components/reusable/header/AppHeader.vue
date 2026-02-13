<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useSiteStore } from '@/stores/siteStore'
import { Download, Loader2 } from 'lucide-vue-next'

const route = useRoute()
defineEmits(['filters', 'export'])
const { exportSites, isExporting } = useSiteStore()

// Senior Tip: Use a computed property for cleaner template logic
const isDashboard = computed(() => route.path === '/dashboard')

const handleExport = async () => {
  await exportSites()
}
</script>

<template>
  <header
    class="w-full bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between"
  >
    <div class="flex items-center gap-4">
      <span class="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">
        Solar Analysis Engine
      </span>
    </div>

    <div class="flex items-center gap-3">
      <button
        v-if="isDashboard"
        @click="handleExport"
        :disabled="isExporting"
        class="px-4 py-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/50 rounded-md hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
      >
        <Loader2 v-if="isExporting" class="w-3.5 h-3.5 animate-spin" />
        <Download v-else class="w-3.5 h-3.5" />

        <span>{{ isExporting ? 'EXPORTING...' : 'EXPORT CSV' }}</span>
      </button>

      <button
        @click="$emit('filters')"
        class="px-4 py-1.5 text-xs font-semibold text-gray-300 bg-transparent border border-gray-700 rounded-md hover:bg-gray-800 hover:text-white transition-all"
      >
        FILTERS
      </button>
    </div>
  </header>
</template>
