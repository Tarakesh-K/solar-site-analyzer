<script setup lang="ts">
const props = defineProps<{
  heading?: string
}>()
</script>

<template>
  <div class="space-y-4 p-3 bg-gray-900 border border-gray-800 rounded-md text-xs">
    <div class="font-semibold text-gray-400 tracking-wider text-xs">
      {{ props.heading }}
    </div>
    <slot />
  </div>
</template>
