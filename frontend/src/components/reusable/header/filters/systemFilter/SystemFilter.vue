<script setup lang="ts">
import { computed } from 'vue'
import { useSiteStore } from '@/stores/siteStore'
import InputFilter from '@/components/reusable/header/filters/searchFilter/InputFilter.vue'
import { RANGE_LIMIT_FOR_SITES } from '@/constants/mapConstants'
import type { InputFilterT } from '@/types/filters/inputTypes'
import FilterWrapper from '@/components/reusable/header/filters/FilterWrapper.vue'

const siteStore = useSiteStore()
const filters = computed(() => siteStore.mapFilters)

/**
 * Update global system filters like 'limit' and 'offset'
 */
const updateFilter = (key: keyof typeof filters.value, value: InputFilterT) => {
  siteStore.setMapFilterValue(key, value)
}

/**
 * Resets limit and offset to null or default values
 */
const clearSystemFilters = () => {
  RANGE_LIMIT_FOR_SITES.forEach((item) => {
    siteStore.setMapFilterValue(item.column, null)
  })
}
</script>

<template>
  <FilterWrapper heading="System Filters">
    <div class="space-y-4">
      <InputFilter
        v-for="item in RANGE_LIMIT_FOR_SITES"
        :key="item.column"
        :label="item.label"
        :placeholder="item.placeholder"
        :modelValue="filters[item.column] ?? null"
        :type="'number'"
        @update:modelValue="
          (val: InputFilterT) => updateFilter(item.column, val as Partial<InputFilterT>)
        "
      />

      <div class="pt-2">
        <button
          @click="clearSystemFilters"
          class="px-3 py-1 text-[10px] font-bold rounded bg-red-900/40 text-red-400 border border-red-900/50 hover:bg-red-600 hover:text-white transition-colors"
        >
          Reset System Params
        </button>
      </div>
    </div>
  </FilterWrapper>
</template>
