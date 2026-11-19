<script setup lang="ts">
const props = defineProps<{ summary: SummaryDto }>()
const { money } = useFormat()
const cur = computed(() => props.summary.currency)
const over = computed(() => (props.summary.remaining ?? 0) < 0)
const ratio = computed(() => (props.summary.budgetAmount ? props.summary.grandTotal / props.summary.budgetAmount : 0))
const typeRows = computed(() => ITEM_TYPES.filter(t => props.summary.byType[t.value] != null)
  .map(t => ({ ...t, amount: props.summary.byType[t.value]! })))
</script>

<template>
  <div class="card flex flex-col gap-2 p-4">
    <template v-if="summary.remaining != null">
      <div>
        <p class="text-[13px] font-semibold text-muted">
          {{ over ? $t('costs.over') : $t('costs.remaining') }}
        </p>
        <p
          class="text-[32px] leading-[38px] font-extrabold"
          :class="over ? 'text-secondary-500' : 'text-primary'"
        >
          {{ money(Math.abs(summary.remaining), cur) }}
        </p>
      </div>
      <div class="h-2.5 overflow-hidden rounded-full bg-[#F3ECE3]">
        <div
          class="h-full rounded-full"
          :class="over ? 'bg-secondary-400' : 'bg-primary'"
          :style="{ width: `${Math.min(ratio, 1) * 100}%` }"
        />
      </div>
    </template>
    <div v-else>
      <p class="text-[13px] font-semibold text-muted">
        {{ $t('costs.totalPlanned') }}
      </p>
      <p class="text-[32px] leading-[38px] font-extrabold text-primary">
        {{ money(summary.grandTotal, cur) }}
      </p>
    </div>

    <div class="flex justify-between text-sm">
      <span class="text-muted">{{ $t('costs.itinerary') }}</span><span class="font-semibold">{{ money(summary.itineraryTotal, cur) }}</span>
    </div>
    <div
      v-for="row in typeRows"
      :key="row.value"
      class="flex items-center gap-2 pl-2.5 text-sm text-muted"
    >
      <span
        class="size-2 rounded-full"
        :style="{ background: row.color }"
      />
      <span class="flex-1">{{ $t(`itemTypes.${row.value}`) }}</span>
      <span>{{ money(row.amount, cur) }}</span>
    </div>
    <div class="flex justify-between text-sm">
      <span class="text-muted">{{ $t('costs.otherCosts') }}</span><span class="font-semibold">{{ money(summary.otherCostsTotal, cur) }}</span>
    </div>
    <div class="h-px bg-[#F0E6DA]" />
    <div class="flex justify-between text-sm">
      <span class="font-semibold">{{ $t('costs.totalPlanned') }}</span><span class="font-bold">{{ money(summary.grandTotal, cur) }}</span>
    </div>
    <div class="flex justify-between text-sm">
      <span class="text-muted">{{ $t('costs.expectedBudget') }}</span>
      <span class="font-semibold">{{ summary.budgetAmount != null ? money(summary.budgetAmount, cur) : $t('costs.noBudget') }}</span>
    </div>
    <UAlert
      v-for="c in summary.missingRates"
      :key="c"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      :title="$t('costs.missingRate', { currency: c })"
      class="mt-1"
    />
  </div>
</template>
