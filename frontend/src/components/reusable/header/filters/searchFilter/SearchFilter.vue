<script setup lang="ts">
import { computed } from 'vue'
import { useSiteStore } from '@/stores/siteStore'
import InputFilter from '@/components/reusable/header/filters/searchFilter/InputFilter.vue'
import { SEARCH_EXACT_COLUMNS_FOR_SITES } from '@/constants/mapConstants'
import type { InputFilterT } from '@/types/filters/inputTypes'
import FilterWrapper from '../FilterWrapper.vue'

const siteStore = useSiteStore()
const filters = computed(() => siteStore.mapFilters)

const updateFilter = (key: keyof typeof filters.value, value: InputFilterT) => {
  siteStore.setMapFilterValue(key, value)
}

const clearSearchFilters = () => {
  SEARCH_EXACT_COLUMNS_FOR_SITES.forEach((item) => {
    siteStore.setMapFilterValue(item.column, null)
  })
}
</script>

<template>
  <FilterWrapper heading="Search Filters">
    <InputFilter
      v-for="item in SEARCH_EXACT_COLUMNS_FOR_SITES"
      :key="item.column"
      :label="item.label"
      :placeholder="item.placeholder"
      :modelValue="filters[item.column] ?? null"
      :type="'text'"
      @update:modelValue="
        (val: InputFilterT) => updateFilter(item.column, val as Partial<InputFilterT>)
      "
    />

    <div class="pt-2">
      <button
        @click="clearSearchFilters"
        class="px-3 py-1 text-[10px] font-bold rounded bg-red-600 text-white hover:bg-red-700"
      >
        Clear Search Filters
      </button>
    </div>
  </FilterWrapper>
</template>
