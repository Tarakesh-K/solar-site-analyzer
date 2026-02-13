<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMapLogic } from '@/composables/useSiteLogic'
import MapFilters from '@/components/reusable/header/filters/MapFilters.vue'

const route = useRoute()
defineEmits(['apply'])
const {} = useMapLogic()

// Determine which filter set to show based on the route path
const currentContext = computed(() => {
  if (route.path === '/') return 'map'
  if (route.path === '/dashboard') return 'dashboard'
  return 'default'
})
</script>

<template>
  <div
    class="absolute z-1000 right-6 top-14 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 p-4 text-white"
  >
    <h3 class="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider">
      {{ currentContext }} Filters
    </h3>

    <div v-if="currentContext === 'map'" class="space-y-4">
      <MapFilters />
    </div>

    <div v-else-if="currentContext === 'dashboard'" class="space-y-4">
      <div>
        <label class="text-[10px] text-gray-400 block mb-1">DATE RANGE</label>
        <select class="w-full bg-gray-900 border border-gray-700 text-xs p-2 rounded">
          <option>Last 30 Days</option>
          <option>Last Quarter</option>
          <option>Year to Date</option>
        </select>
      </div>
    </div>

    <button
      @click="$emit('apply')"
      class="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded transition-colors"
    >
      APPLY FILTERS
    </button>
  </div>
</template>
