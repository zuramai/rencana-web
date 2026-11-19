<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
defineProps<{ title: string }>()
</script>

<template>
  <UDrawer
    v-model:open="open"
    :title="title"
    :close="{ variant: 'soft', class: 'size-9 justify-center rounded-full bg-[#F5EFE7] text-default' }"
    :ui="{
      content: 'mx-auto max-w-md rounded-t-[28px] bg-white max-h-[94dvh]',
      container: 'min-h-0 gap-3 overflow-hidden p-0 pt-2',
      header: 'flex items-center justify-between px-4',
      title: 'text-xl font-bold text-default',
      body: 'min-h-0 flex-1 overflow-y-auto px-4 pb-4',
      footer: 'border-t border-default px-4 pt-3 pb-[max(env(safe-area-inset-bottom),24px)] gap-1'
    }"
  >
    <template #body>
      <slot />
    </template>
    <template
      v-if="$slots.footer"
      #footer
    >
      <slot name="footer" />
    </template>
  </UDrawer>
</template>
