<script setup lang="ts">
definePageMeta({ layout: 'plain' })
const route = useRoute()
const { t } = useI18n()
const toast = useToast()
const id = route.params.id as string
const fromList = route.query.from === 'list'

const { data: plan, error } = await useFetch<PlanDto>(`/api/plans/${id}`)
if (error.value) throw createError({ statusCode: 404, statusMessage: t('errors.plan_not_found'), fatal: true })

async function saved() {
  toast.add({ title: t('travel.tripSaved'), color: 'success', icon: 'i-lucide-check' })
  await navigateTo(fromList ? '/travel' : `/travel/${id}`)
}
</script>

<template>
  <div>
    <PageHeader
      :title="$t('plan.editTrip')"
      :back="fromList ? '/travel' : `/travel/${id}`"
    />
    <PlanForm
      v-if="plan"
      :plan="plan"
      @saved="saved"
    />
  </div>
</template>
