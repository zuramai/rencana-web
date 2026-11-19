<script setup lang="ts">
const props = defineProps<{ costs: CostDto[], summary: SummaryDto }>()
defineEmits<{ open: [cost: CostDto], add: [preset?: typeof COST_PRESETS[number]] }>()
const { money } = useFormat()
const { t } = useI18n()

function subtitle(cost: CostDto) {
  if (cost.frequency === 'one_time') return t('costs.oneTime')
  const days = cost.days ?? props.summary.tripDays
  const amount = money(cost.amount, cost.currency)
  return cost.days == null ? t('costs.perDayTripLength', { amount, days }) : t('costs.perDay', { amount, days })
}
const totals = computed(() => new Map(props.summary.costs.map(c => [c.id, c])))
const usedPresets = computed(() => new Set(props.costs.map(c => c.name)))
const presets = computed(() => COST_PRESETS.filter(p => !usedPresets.value.has(t(`costPresets.${p.key}`))))
</script>

<template>
  <div class="card flex flex-col gap-1.5 p-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">
        {{ $t('costs.otherCosts') }}
      </h2>
      <UButton
        icon="i-lucide-plus"
        color="primary"
        variant="soft"
        class="h-[34px] bg-[#E0F2F1] px-3 text-primary-700"
        @click="$emit('add')"
      >
        {{ $t('costs.addCost') }}
      </UButton>
    </div>
    <p
      v-if="!costs.length"
      class="py-2 text-sm text-muted"
    >
      {{ $t('costs.empty') }}
    </p>
    <button
      v-for="cost in costs"
      :key="cost.id"
      type="button"
      class="flex items-center gap-2 border-b border-default py-2.5 text-left"
      @click="$emit('open', cost)"
    >
      <span class="min-w-0 flex-1">
        <span class="block font-semibold">{{ cost.name }}</span>
        <span class="block text-[13px] font-semibold text-muted">{{ subtitle(cost) }}</span>
      </span>
      <span class="text-right text-sm font-bold">
        {{ money(totals.get(cost.id)?.total ?? Number(cost.amount), cost.currency) }}
        <span
          v-if="cost.currency !== summary.currency && totals.get(cost.id)?.converted != null"
          class="block text-xs font-semibold text-muted"
        >
          ≈ {{ money(totals.get(cost.id)!.converted!, summary.currency) }}
        </span>
      </span>
    </button>
    <div
      v-if="presets.length"
      class="flex gap-1.5 overflow-x-auto pt-1.5 pb-0.5 [scrollbar-width:none]"
    >
      <button
        v-for="preset in presets"
        :key="preset.key"
        type="button"
        class="h-9 shrink-0 rounded-full bg-white px-3.5 text-sm font-semibold ring-[1.5px] ring-[#F0E6DA] ring-inset"
        @click="$emit('add', preset)"
      >
        + {{ $t(`costPresets.${preset.key}`) }}
      </button>
    </div>
  </div>
</template>
