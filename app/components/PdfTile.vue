<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <div class="flex size-full flex-col items-center justify-center gap-1.5 bg-[#FDECEC] p-2">
    <UIcon
      name="i-lucide-file-text"
      class="size-8 text-error"
    />
    <span class="line-clamp-2 text-center text-xs font-semibold break-all text-muted">{{ name }}</span>
  </div>
</template>
