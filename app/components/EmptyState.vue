<script setup lang="ts">
withDefaults(defineProps<{
  pose: 'wave' | 'happy' | 'map' | 'construction'
  title: string
  text: string
  size?: number
}>(), { size: 160 })
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-6 text-center">
    <AppMascot
      :pose="pose"
      :size="size"
    />
    <div class="flex flex-col gap-1.5">
      <h2 class="text-xl font-bold">
        {{ title }}
      </h2>
      <p class="mx-auto max-w-[300px] text-base text-muted">
        {{ text }}
      </p>
    </div>
    <slot />
  </div>
</template>
