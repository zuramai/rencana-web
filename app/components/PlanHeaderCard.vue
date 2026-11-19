<script setup lang="ts">
const props = defineProps<{ plan: PlanDto, summary: SummaryDto | null }>()
const { t } = useI18n()
const { money, period } = useFormat()

const periodLabel = computed(() => period(props.plan) ?? t('travel.noDate'))
const budget = computed(() => props.summary?.budgetAmount ?? null)
const spent = computed(() => props.summary?.grandTotal ?? 0)
const ratio = computed(() => (budget.value ? spent.value / budget.value : 0))
</script>

<template>
  <div class="card flex flex-col gap-3.5 p-4">
    <div class="flex items-center gap-3.5">
      <PlanCover
        :cover="plan"
        :size="72"
        :radius="20"
      />
      <div class="min-w-0">
        <h1 class="text-xl leading-[26px] font-bold break-words">
          {{ plan.name }}
        </h1>
        <p class="mt-1 flex items-center gap-1 text-[13px] font-semibold text-muted">
          <UIcon
            name="i-lucide-calendar"
            class="size-3.5"
          />
          {{ periodLabel }}
        </p>
      </div>
    </div>
    <div
      v-if="summary && budget != null"
      class="flex flex-col gap-2"
    >
      <p class="text-[13px] font-semibold text-muted">
        <i18n-t
          keypath="plan.planned"
          tag="span"
          scope="global"
        >
          <template #spent>
            <span
              class="text-sm font-bold"
              :class="ratio > 1 ? 'text-secondary-500' : 'text-default'"
            >{{ money(spent, summary.currency) }}</span>
          </template>
          <template #budget>
            {{ money(budget, summary.currency) }}
          </template>
        </i18n-t>
      </p>
      <div class="h-2.5 overflow-hidden rounded-full bg-[#F3ECE3]">
        <div
          class="h-full rounded-full transition-all"
          :class="ratio > 1 ? 'bg-secondary-400' : 'bg-primary'"
          :style="{ width: `${Math.min(ratio, 1) * 100}%` }"
        />
      </div>
    </div>
  </div>
</template>
