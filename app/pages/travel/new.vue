<script setup lang="ts">
definePageMeta({ layout: 'plain' })
const { t } = useI18n()
const toast = useToast()

async function created(id: string) {
  toast.add({ title: t('travel.tripCreated'), avatar: { src: '/mascot/happy.svg', alt: 'Koper' }, color: 'primary' })
  await navigateTo(`/travel/${id}`)
}
</script>

<template>
  <div>
    <PageHeader
      :title="$t('plan.newTrip')"
      back="/travel"
    />
    <PlanForm @saved="created" />
  </div>
</template>
