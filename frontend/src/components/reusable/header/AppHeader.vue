<script setup lang="ts">
defineEmits(['filters'])
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
        @click="$emit('filters')"
        class="px-4 py-1.5 text-xs font-semibold text-gray-300 bg-transparent border border-gray-700 rounded-md hover:bg-gray-800 hover:text-white transition-all"
      >
        FILTERS
      </button>
    </div>
  </header>
</template>
