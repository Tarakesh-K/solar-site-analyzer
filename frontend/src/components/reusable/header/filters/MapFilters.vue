<script setup lang="ts">
import ChooseFilters from '@/components/reusable/header/filters/ChooseFilters.vue'
import { useSiteStore } from '@/stores/siteStore'
import { computed } from 'vue'

const siteStore = useSiteStore()

const selectedFilterTypes = computed(() => siteStore.activePanels.length)
</script>

<template>
  <div class="h-100 overflow-y-auto space-y-4 p-2 border border-gray-700 rounded bg-gray-900">
    <ChooseFilters />

    <hr class="border-gray-800" />

    <div v-if="selectedFilterTypes === 0" class="text-center text-gray-500 text-xs py-10">
      No filters active. Choose one above to start.
    </div>
  </div>
</template>
