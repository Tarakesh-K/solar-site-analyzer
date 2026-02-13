<script setup lang="ts">
// Defining the props with the correct TypeScript syntax
defineProps<{
  title: string
  label: string | number
}>()
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-sm hover:border-blue-500/50 transition-colors">
    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
      {{ title }}
    </p>
    <p class="text-xl font-mono text-white">
      {{ label }}
    </p>
  </div>
</template>