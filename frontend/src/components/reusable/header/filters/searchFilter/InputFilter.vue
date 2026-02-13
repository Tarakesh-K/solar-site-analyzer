<script setup lang="ts">
import type { InputFilterT } from '@/types/filters/inputTypes'
import type { InputTypeHTMLAttribute } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: InputFilterT
    label: string
    placeholder?: string
    type: InputTypeHTMLAttribute
  }>(),
  {},
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: InputFilterT): void
}>()

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  let value: InputFilterT = target.value

  if (value === '') {
    value = null
  } else if (props.type === 'number') {
    value = Number(value)
  }

  emit('update:modelValue', value)
}
</script>

<template>
  <div>
    <label class="block text-gray-500 mb-1">
      {{ label }}
    </label>

    <input
      :value="modelValue ?? ''"
      :type="type"
      :placeholder="placeholder"
      @input="handleInput"
      class="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white focus:border-blue-500 outline-none"
    />
  </div>
</template>
