<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ planId: string, hasTickets: boolean }>()
const { t } = useI18n()

const rows = computed(() => [
  { kind: 'itinerary-pdf', icon: 'i-lucide-file-text', color: '#EF4444', title: t('export.itineraryPdf'), sub: t('export.itineraryPdfSub'), disabled: false },
  { kind: 'itinerary-xlsx', icon: 'i-lucide-file-spreadsheet', color: '#16A34A', title: t('export.itineraryXlsx'), sub: t('export.itineraryXlsxSub'), disabled: false },
  { kind: 'tickets-pdf', icon: 'i-lucide-ticket', color: '#3B82F6', title: t('export.ticketsPdf'), sub: props.hasTickets ? t('export.ticketsPdfSub') : t('export.noTickets'), disabled: !props.hasTickets }
])
</script>

<template>
  <FormDrawer
    v-model:open="open"
    :title="$t('export.title')"
  >
    <div class="flex flex-col gap-3 pb-4">
      <component
        :is="row.disabled ? 'div' : 'a'"
        v-for="row in rows"
        :key="row.kind"
        :href="row.disabled ? undefined : `/api/plans/${planId}/export/${row.kind}`"
        :download="row.disabled ? undefined : ''"
        class="flex items-center gap-3 rounded-2xl bg-[#FAF6F0] p-3"
        :class="row.disabled ? 'opacity-50' : ''"
        :aria-disabled="row.disabled"
      >
        <span
          class="flex size-11 items-center justify-center rounded-[14px]"
          :style="{ background: `${row.color}22`, color: row.color }"
        >
          <UIcon
            :name="row.icon"
            class="size-[22px]"
          />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block font-semibold">{{ row.title }}</span>
          <span class="block text-[13px] font-semibold text-muted">{{ row.sub }}</span>
        </span>
        <UIcon
          name="i-lucide-download"
          class="size-5 text-muted"
        />
      </component>
    </div>
  </FormDrawer>
</template>
