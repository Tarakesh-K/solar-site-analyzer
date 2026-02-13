<script setup lang="ts">
import { useSiteStore } from '@/stores/siteStore'
import { RANGE_EXACT_COLUMNS_FOR_SITES } from '@/constants/mapConstants'
import type { NumericSiteColumns } from '@/types/sites'
import RangeExactInput from '@/components/reusable/header/filters/rangeFilter/RangeExactInput.vue'
import FilterWrapper from '@/components/reusable/header/filters/FilterWrapper.vue'

const siteStore = useSiteStore()

/* Add Filter                         */
const addFilter = (column: NumericSiteColumns) => {
  siteStore.setMapFilterValue('rangeExactFilter', {
    col: column,
    mode: 'range',
    min_score: null,
    max_score: null,
    score: null,
  })
}

const isAlreadyActive = (col: NumericSiteColumns) => {
  return siteStore.mapFilters.rangeExactFilter?.some((f) => f.col === col)
}

const removeFilter = (column: NumericSiteColumns) => {
  const filters = siteStore.mapFilters.rangeExactFilter ?? []
  siteStore.mapFilters.rangeExactFilter = filters.filter((f) => f.col !== column)
}

const resetAnalyticalFilters = () => {
  siteStore.mapFilters.rangeExactFilter = []
}
</script>

<template>
  <FilterWrapper heading="Analytical Filters">
    <!-- Add Filter Buttons    -->
    <div class="flex flex-wrap gap-2">
      <div v-for="col in RANGE_EXACT_COLUMNS_FOR_SITES" :key="col.column" class="relative">
        <button
          @click="!isAlreadyActive(col.column) && addFilter(col.column)"
          class="px-2 py-1 text-[10px] font-bold rounded border uppercase transition pr-5"
          :class="
            isAlreadyActive(col.column)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-blue-900/20 border-blue-500/50 text-blue-400 hover:bg-blue-600 hover:text-white'
          "
        >
          {{ col.shortLabel }}
        </button>

        <!-- Remove Button -->
        <button
          v-if="isAlreadyActive(col.column)"
          @click.stop="removeFilter(col.column)"
          class="absolute top-0 right-0 -mt-1 -mr-1 w-4 h-4 text-[9px] rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Active Range Inputs   -->
    <div class="space-y-4">
      <RangeExactInput
        v-for="filter in siteStore.mapFilters.rangeExactFilter"
        :key="filter.col"
        :column="filter.col"
        :label="RANGE_EXACT_COLUMNS_FOR_SITES.find((c) => c.column === filter.col)?.label as string"
        :shortLabel="
          RANGE_EXACT_COLUMNS_FOR_SITES.find((c) => c.column === filter.col)?.shortLabel as string
        "
      />
    </div>

    <div class="">
      <button
        @click="resetAnalyticalFilters"
        class="px-3 py-1 text-[10px] font-bold rounded bg-red-900/40 text-red-400 border border-red-900/50 hover:bg-red-600 hover:text-white transition-colors"
      >
        Reset Analytical Filters
      </button>
    </div>
  </FilterWrapper>
</template>
