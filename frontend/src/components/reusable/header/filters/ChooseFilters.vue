<script setup lang="ts">
import SearchFilter from '@/components/reusable/header/filters/searchFilter/SearchFilter.vue'
import AnalyticalFilter from '@/components/reusable/header/filters/rangeFilter/AnalyticalFilter.vue'
import SystemFilter from '@/components/reusable/header/filters/systemFilter/SystemFilter.vue'
import { useSiteStore } from '@/stores/siteStore'
const siteStore = useSiteStore()
</script>

<template>
  <div class="space-y-6">
    <!-- Buttons -->
    <div class="grid grid-cols-4 gap-3">
      <button
        @click="siteStore.togglePanel('search')"
        :class="
          siteStore.activePanels.includes('search')
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-400'
        "
        class="px-3 py-2 rounded text-xs font-bold uppercase col-span-2"
      >
        Search
      </button>

      <button
        @click="siteStore.togglePanel('analytical')"
        :class="
          siteStore.activePanels.includes('analytical')
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-400'
        "
        class="px-3 py-2 rounded text-xs font-bold uppercase col-span-2"
      >
        Analytical
      </button>

      <button
        @click="siteStore.togglePanel('system')"
        :class="
          siteStore.activePanels.includes('system')
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-400'
        "
        class="px-3 py-2 rounded text-xs font-bold uppercase col-span-4"
      >
        System
      </button>
    </div>

    <!-- Dynamic Rendering -->
    <div class="space-y-6">
      <template v-for="panel in siteStore.activePanels" :key="panel">
        <SearchFilter v-if="panel === 'search'" />
        <AnalyticalFilter v-else-if="panel === 'analytical'" />
        <SystemFilter v-else-if="panel === 'system'" />
      </template>
    </div>
  </div>
</template>
