<script setup lang="ts">
const { $api } = useNuxtApp()
const { t } = useI18n()
const toast = useToast()
const errorMessage = useErrorMessage()
const { data: plans, refresh } = await useApi<PlanListItem[]>('/api/plans', { default: () => [] })

const toDelete = ref<PlanListItem | null>(null)
const confirmOpen = computed({
  get: () => toDelete.value != null,
  set: (open) => { if (!open) toDelete.value = null }
})
const deleting = ref(false)

async function confirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await $api(`/api/plans/${toDelete.value.id}`, { method: 'DELETE' })
    toDelete.value = null
    toast.add({ title: t('travel.tripDeleted'), color: 'neutral', icon: 'i-lucide-trash-2' })
    await refresh()
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-3.5 pt-3">
    <div class="flex items-baseline justify-between">
      <h1 class="text-[28px] leading-[34px] font-extrabold">
        {{ $t('travel.myTrips') }}
      </h1>
      <span
        v-if="plans.length"
        class="text-[13px] font-semibold text-muted"
      >{{ $t('travel.tripCount', plans.length) }}</span>
    </div>

    <template v-if="plans.length">
      <PlanCard
        v-for="plan in plans"
        :key="plan.id"
        :plan="plan"
        @delete="toDelete = plan"
      />
      <div class="fixed inset-x-0 bottom-(--nav-h) z-30 bg-linear-to-b from-[#FFFBF5]/0 to-[#FFFBF5] px-4 py-3">
        <div class="mx-auto max-w-md">
          <UButton
            to="/travel/new"
            block
            class="h-[52px] text-base"
          >
            {{ $t('travel.createPlan') }}
          </UButton>
        </div>
      </div>
    </template>
    <EmptyState
      v-else
      pose="map"
      :title="$t('travel.noTrips')"
      :text="$t('travel.noTripsText')"
      class="mt-9"
    >
      <UButton
        to="/travel/new"
        class="h-[52px] w-[220px] justify-center text-base"
      >
        {{ $t('travel.createPlan') }}
      </UButton>
    </EmptyState>

    <ConfirmDelete
      v-model:open="confirmOpen"
      :title="$t('travel.deleteTitle', { name: toDelete?.name ?? '' })"
      :text="$t('travel.deleteText')"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>
