<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
defineProps<{ title: string, text: string, loading?: boolean }>()
const emit = defineEmits<{ confirm: [] }>()
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{ content: 'max-w-[345px] rounded-[28px]' }"
  >
    <template #content>
      <div class="flex flex-col items-center gap-3 p-6 text-center">
        <span class="flex size-14 items-center justify-center rounded-full bg-red-100">
          <UIcon
            name="i-lucide-trash-2"
            class="size-[26px] text-error"
          />
        </span>
        <h2 class="text-xl font-bold">
          {{ title }}
        </h2>
        <p class="text-muted">
          {{ text }}
        </p>
        <div class="mt-1 flex w-full gap-3">
          <UButton
            block
            color="neutral"
            variant="outline"
            class="h-[52px] bg-white text-base ring-[1.5px] ring-[#F0E6DA]"
            @click="open = false"
          >
            {{ $t('common.cancel') }}
          </UButton>
          <UButton
            block
            color="error"
            class="h-[52px] text-base"
            :loading="loading"
            @click="emit('confirm')"
          >
            {{ $t('common.delete') }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
