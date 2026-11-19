<script setup lang="ts">
defineProps<{ title?: string, back?: string }>()
</script>

<template>
  <div class="sticky top-0 z-30 -mx-4 flex h-[60px] items-center gap-2 bg-[#FFFBF5]/95 px-3 pr-4 backdrop-blur">
    <UButton
      :to="back"
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="ghost"
      class="size-10 justify-center bg-white"
      :aria-label="$t('common.back')"
      @click="back ? undefined : $router.back()"
    />
    <h1
      v-if="title"
      class="text-xl font-bold"
    >
      {{ title }}
    </h1>
    <div class="ml-auto flex gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
