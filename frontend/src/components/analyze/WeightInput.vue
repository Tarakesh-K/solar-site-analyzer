<script setup lang="ts">
defineProps<{
  label: string
  modelValue: number
}>()

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col gap-1 w-full">
    <label class="text-[10px] font-bold text-gray-500 tracking-widest ml-1">
      {{ label }}
    </label>
    <input
      type="number"
      step="0.01"
      min="0"
      max="1"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).valueAsNumber)"
      class="bg-zinc-900 border border-zinc-800 text-blue-400 p-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm transition-all"
    />
  </div>
</template>
