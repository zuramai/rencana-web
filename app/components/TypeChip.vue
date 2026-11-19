<script setup lang="ts">
const props = withDefaults(defineProps<{ type: ItemType, size?: number }>(), { size: 36 })
const meta = computed(() => ITEM_TYPES.find(t => t.value === props.type) ?? ITEM_TYPES[7])
</script>

<template>
  <span
    class="flex shrink-0 items-center justify-center rounded-full"
    :style="{ width: `${size}px`, height: `${size}px`, background: `${meta.color}33`, color: meta.color }"
  >
    <UIcon
      :name="meta.icon"
      :style="{ width: `${size / 2}px`, height: `${size / 2}px` }"
    />
  </span>
</template>
