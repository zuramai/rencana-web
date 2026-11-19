<script setup lang="ts">
definePageMeta({ topBar: false })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const id = route.params.id as string

const { data: plan, error } = await useApi<PlanDto>(`/api/plans/${id}`)
if (error.value) throw createError({ statusCode: 404, statusMessage: t('errors.plan_not_found'), fatal: true })

const [{ data: items, refresh: refreshItems }, { data: summary, refresh: refreshSummary }, { data: costs, refresh: refreshCosts }, { data: tickets, refresh: refreshTickets }] = await Promise.all([
  useApi<ItemDto[]>(`/api/plans/${id}/items`, { default: () => [] }),
  useApi<SummaryDto>(`/api/plans/${id}/summary`),
  useApi<CostDto[]>(`/api/plans/${id}/costs`, { default: () => [] }),
  useApi<TicketDto[]>(`/api/plans/${id}/tickets`, { default: () => [] })
])

type Tab = 'itinerary' | 'costs' | 'tickets'
const tab = computed<Tab>({
  get: () => (['itinerary', 'costs', 'tickets'].includes(String(route.query.tab)) ? route.query.tab as Tab : 'itinerary'),
  set: value => router.replace({ query: { ...route.query, tab: value === 'itinerary' ? undefined : value } })
})

// Itinerary
const itemFormOpen = ref(false)
const editingItem = ref<ItemDto | null>(null)
const defaultStart = computed(() => {
  const last = items.value.at(-1)
  const date = last ? (last.endsAt ?? last.startsAt).slice(0, 10) : new Date().toLocaleDateString('sv-SE')
  return `${date}T09:00`
})
function openItem(item: ItemDto | null) {
  editingItem.value = item
  itemFormOpen.value = true
}
async function itemsChanged() {
  await Promise.all([refreshItems(), refreshSummary()])
}

// Costs
const costFormOpen = ref(false)
const editingCost = ref<CostDto | null>(null)
const costPreset = ref<typeof COST_PRESETS[number] | null>(null)
function openCost(cost: CostDto | null, preset: typeof COST_PRESETS[number] | null = null) {
  editingCost.value = cost
  costPreset.value = preset
  costFormOpen.value = true
}
async function costsChanged() {
  await Promise.all([refreshCosts(), refreshSummary()])
}

// Tickets
const viewerOpen = ref(false)
const ticketFormOpen = ref(false)
const viewingTicket = ref<TicketDto | null>(null)
const editingTicket = ref<TicketDto | null>(null)
function viewTicket(ticket: TicketDto) {
  viewingTicket.value = ticket
  viewerOpen.value = true
}
function openTicketForm(ticket: TicketDto | null) {
  editingTicket.value = ticket
  viewerOpen.value = false
  ticketFormOpen.value = true
}

const exportOpen = ref(false)
</script>

<template>
  <div
    v-if="plan"
    class="flex flex-col gap-3"
  >
    <PageHeader back="/travel">
      <template #actions>
        <UButton
          icon="i-lucide-download"
          color="neutral"
          variant="ghost"
          class="size-10 justify-center bg-white"
          :aria-label="$t('export.title')"
          @click="exportOpen = true"
        />
        <UButton
          :to="`/travel/${plan.id}/edit`"
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          class="size-10 justify-center bg-white"
          :aria-label="$t('plan.editTrip')"
        />
      </template>
    </PageHeader>

    <PlanHeaderCard
      :plan="plan"
      :summary="summary ?? null"
    />
    <SegmentedControl
      v-model="tab"
      :options="[
        { value: 'itinerary', label: $t('plan.tabs.itinerary') },
        { value: 'costs', label: $t('plan.tabs.costs') },
        { value: 'tickets', label: $t('plan.tabs.tickets') }
      ]"
    />

    <template v-if="tab === 'itinerary'">
      <ItineraryList
        :items="items"
        @open="openItem"
        @add="openItem(null)"
      />
      <div class="pointer-events-none fixed inset-x-0 bottom-[calc(var(--nav-h)+16px)] z-30">
        <div class="mx-auto flex max-w-md justify-end px-4">
          <button
            type="button"
            class="pointer-events-auto flex size-14 items-center justify-center rounded-full bg-secondary-400 text-white shadow-[0_6px_14px_#FB923C66] active:scale-95"
            :aria-label="$t('itinerary.addActivity')"
            @click="openItem(null)"
          >
            <UIcon
              name="i-lucide-plus"
              class="size-7"
            />
          </button>
        </div>
      </div>
    </template>

    <template v-else-if="tab === 'costs' && summary">
      <BudgetSummaryCard :summary="summary" />
      <CostList
        :costs="costs"
        :summary="summary"
        @open="openCost"
        @add="preset => openCost(null, preset ?? null)"
      />
      <RatesCard
        :plan-id="plan.id"
        :summary="summary"
        @changed="refreshSummary()"
      />
    </template>

    <TicketGrid
      v-else-if="tab === 'tickets'"
      :tickets="tickets"
      @open="viewTicket"
      @add="openTicketForm(null)"
    />

    <ItineraryItemForm
      v-model:open="itemFormOpen"
      :plan-id="plan.id"
      :budget-currency="plan.budgetCurrency"
      :item="editingItem"
      :default-start="defaultStart"
      @saved="itemsChanged"
    />
    <CostForm
      v-model:open="costFormOpen"
      :plan-id="plan.id"
      :budget-currency="plan.budgetCurrency"
      :trip-days="summary?.tripDays ?? 1"
      :cost="editingCost"
      :preset="costPreset"
      @saved="costsChanged"
    />
    <TicketViewer
      v-model:open="viewerOpen"
      :plan-id="plan.id"
      :ticket="viewingTicket"
      @edit="openTicketForm(viewingTicket)"
      @deleted="refreshTickets()"
    />
    <TicketForm
      v-model:open="ticketFormOpen"
      :plan-id="plan.id"
      :ticket="editingTicket"
      @saved="refreshTickets()"
    />
    <ExportSheet
      v-model:open="exportOpen"
      :plan-id="plan.id"
      :has-tickets="tickets.length > 0"
    />
  </div>
</template>
