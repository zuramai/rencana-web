<script setup lang="ts">
withDefaults(defineProps<{
  pose: 'wave' | 'happy' | 'map' | 'construction'
  size?: number
}>(), { size: 160 })
</script>

<template>
  <img
    :src="`/mascot/${pose}.svg`"
    :width="size"
    :height="size"
    alt="Koper the suitcase"
    class="select-none"
    draggable="false"
  >
</template>
