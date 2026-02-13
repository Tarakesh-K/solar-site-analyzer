<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import MainLayout from '@/components/reusable/mainStructure/MainLayout.vue'
import NavBar from '@/components/reusable/navbar/NavBar.vue'
import AppHeader from '@/components/reusable/header/AppHeader.vue'
import FilterDropdown from '@/components/reusable/header/FilterDropdown.vue'
import { useMapLogic } from '@/composables/useSiteLogic'
import { queryParamsBuilder } from './utils/queryParams'
import { useEventListener } from '@vueuse/core'

const { mapFilters, fetchSites } = useMapLogic()
const isFilterOpen = ref(false)

const toggleFilters = () => {
  isFilterOpen.value = !isFilterOpen.value
}

useEventListener(window, 'keydown', (e) => {
  if (e.key === 'Escape') isFilterOpen.value = false
})

const handleApplyFilters = async () => {
  const queryParams = queryParamsBuilder(mapFilters)
  await fetchSites(queryParams)
  isFilterOpen.value = false // Close after applying
}
</script>

<template>
  <main class="h-screen flex flex-col overflow-hidden relative">
    <AppHeader @filters="toggleFilters" @applyFilters="handleApplyFilters" />

    <FilterDropdown v-if="isFilterOpen" @apply="handleApplyFilters" />

    <MainLayout class="flex-1 overflow-hidden">
      <div class="w-full grid grid-cols-12 h-full">
        <div class="col-span-3 border-r border-gray-800 bg-gray-900">
          <NavBar />
        </div>
        <div class="col-span-9 bg-gray-50 overflow-auto">
          <RouterView />
        </div>
      </div>
    </MainLayout>
  </main>
</template>
