<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next'
import type { InputWidth } from '@/types/filters/inputTypes'

defineProps<{
  label: string
  icon: LucideIcon
  modelValue: number
  width?: InputWidth
}>()

defineEmits(['update:modelValue'])
</script>

<template>
  <div :class="width === 'full' ? 'col-span-2' : 'col-span-1'" class="flex flex-col gap-1.5">
    <label class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">
      {{ label }}
    </label>
    
    <div class="relative group">
      <div class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
        <component :is="icon" :size="16" stroke-width="2.5" />
      </div>
      
      <input
        type="number"
        step="0.01"
        :value="modelValue"
        @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
        class="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm"
      />
    </div>
  </div>
</template>