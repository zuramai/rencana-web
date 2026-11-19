<script setup lang="ts">
const props = defineProps<{ plan: PlanListItem }>()
defineEmits<{ delete: [] }>()
const { t } = useI18n()
const { period } = useFormat()
const label = computed(() => period(props.plan) ?? t('travel.noDate'))
</script>

<template>
  <div class="card relative flex items-center gap-3 p-3">
    <NuxtLink
      :to="`/travel/${plan.id}`"
      class="absolute inset-0 rounded-[20px]"
      :aria-label="plan.name"
    />
    <PlanCover :cover="plan" />
    <div class="min-w-0 flex-1">
      <p class="truncate text-xl leading-[26px] font-bold">
        {{ plan.name }}
      </p>
      <p class="text-[13px] font-semibold text-muted">
        {{ label }}
      </p>
    </div>
    <div class="relative flex">
      <UButton
        :to="`/travel/${plan.id}/edit?from=list`"
        icon="i-lucide-pencil"
        color="neutral"
        variant="ghost"
        class="size-9 justify-center text-muted"
        :aria-label="$t('common.edit')"
      />
      <UButton
        icon="i-lucide-trash-2"
        color="neutral"
        variant="ghost"
        class="size-9 justify-center text-muted"
        :aria-label="$t('common.delete')"
        @click="$emit('delete')"
      />
    </div>
  </div>
</template>
