<script setup lang="ts">
import RangeExactInput from '@/components/reusable/header/filters/RangeExactInput.vue'
import { RANGE_EXACT_COLUMNS_FOR_SITES } from '@/constants/mapConstants'
</script>

<template>
  <div class="h-100 overflow-y-auto space-y-4 p-2 border border-gray-700 rounded bg-gray-900">
    <RangeExactInput
      v-for="col in RANGE_EXACT_COLUMNS_FOR_SITES"
      :key="col.column"
      :column="col.column"
      :label="col.label"
      :shortLabel="col.shortLabel"
    />
  </div>
</template>