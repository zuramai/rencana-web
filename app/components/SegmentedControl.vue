<script setup lang="ts" generic="T extends string">
const model = defineModel<T>({ required: true })
defineProps<{ options: { value: T, label: string }[] }>()
</script>

<template>
  <div
    class="flex gap-1 rounded-full border-[1.5px] border-default bg-white p-1"
    role="tablist"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      :aria-selected="model === option.value"
      class="h-9 flex-1 rounded-full text-sm font-semibold transition-colors"
      :class="model === option.value ? 'bg-primary text-white' : 'text-muted'"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
