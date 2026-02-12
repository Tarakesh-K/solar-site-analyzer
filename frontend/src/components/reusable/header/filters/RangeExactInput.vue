<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSiteStore } from '@/stores/siteStore'
import type { RangeExactFilter } from '@/types/sites'
import type { FilterMode, RangeExactInputT } from '@/types/header'

const props = defineProps<RangeExactInputT>()

const siteStore = useSiteStore()

// Source of truth for UI toggle
const localFilterMode = ref<FilterMode>(
  siteStore.mapFilters.rangeExactFilter?.find((f) => f.col === props.column)?.mode ?? 'range',
)

/**
 * Computed ensures we are always looking at the freshest data
 * from the store array for this specific column.
 */
const filter = computed((): RangeExactFilter => {
  const f = siteStore.mapFilters.rangeExactFilter?.find((f) => f.col === props.column)
  return f || { col: props.column, min_score: null, max_score: null, score: null }
})

/**
 * Dispatches updates to the store.
 * The store mutation handles nulling out the opposite fields.
 */
const updateStore = (payload: Partial<RangeExactFilter>) => {
  siteStore.setMapFilterValue('rangeExactFilter', {
    col: props.column,
    ...payload,
  })
}

const switchMode = (mode: FilterMode) => {
  if (localFilterMode.value === mode) return

  localFilterMode.value = mode

  if (mode === 'exact') {
    // Switching to Exact → clear range
    updateStore({
      min_score: null,
      max_score: null,
      score: filter.value.score ?? null,
    })
  } else {
    // Switching to Range → clear exact
    updateStore({
      score: filter.value.score ?? null,
      min_score: filter.value.min_score ?? null,
      max_score: filter.value.max_score ?? null,
    })
  }
}
</script>

<template>
  <div class="p-2 bg-gray-900 border border-gray-800 rounded-md text-xs">
    <div class="flex items-center justify-between mb-2">
      <label class="tracking-wider text-gray-400 font-semibold">
        {{ label }} Filter
      </label>

      <div class="flex bg-gray-800 rounded p-0.5 gap-1">
        <button
          @click="switchMode('range')"
          :class="localFilterMode === 'range' ? 'bg-blue-600 text-white' : 'text-gray-400'"
          class="px-1 py-0.5 rounded transition-all font-bold"
        >
          Range
        </button>
        <button
          @click="switchMode('exact')"
          :class="localFilterMode === 'exact' ? 'bg-blue-600 text-white' : 'text-gray-400'"
          class="px-1 py-0.5 rounded transition-all font-bold"
        >
          Exact
        </button>
      </div>
    </div>

    <div v-if="localFilterMode === 'range'" class="flex gap-1">
      <div class="flex-1">
        <span class="block mb-0.5 text-gray-500">Min {{ shortLabel }}</span>
        <input
          :value="filter.min_score"
          @input="(e) => updateStore({ min_score: (e.target as HTMLInputElement).value === '' ? null : Number((e.target as HTMLInputElement).value) })"
          type="number"
          step="0.000001"
          placeholder="Min"
          class="w-full bg-gray-800 border border-gray-700 rounded px-1 py-1 text-white focus:border-blue-500 outline-none"
        />
      </div>
      <div class="flex-1">
        <span class="block mb-0.5 text-gray-500">Max {{ shortLabel }}</span>
        <input
          :value="filter.max_score"
          @input="(e) => updateStore({ max_score: (e.target as HTMLInputElement).value === '' ? null : Number((e.target as HTMLInputElement).value) })"
          type="number"
          step="0.000001"
          placeholder="Max"
          class="w-full bg-gray-800 border border-gray-700 rounded px-1 py-1 text-white focus:border-blue-500 outline-none"
        />
      </div>
    </div>

    <div v-else>
      <span class="block mb-0.5 text-gray-500">Exact {{ label }}</span>
      <input
        :value="filter.score"
        @input="(e) => updateStore({ score: (e.target as HTMLInputElement).value === '' ? null : Number((e.target as HTMLInputElement).value) })"
        type="number"
        step="0.000001"
        placeholder="Exact value"
        class="w-full bg-gray-800 border border-gray-700 rounded px-1 py-1 text-white focus:border-blue-500 outline-none"
      />
    </div>
  </div>
</template>
